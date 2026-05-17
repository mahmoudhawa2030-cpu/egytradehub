"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Send, Check, CheckCheck, ArrowLeft, Clock, AlertCircle,
  Smile, Paperclip, Image as ImageIcon, X, Download, FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useChatNotifications } from "./useChatNotifications";

export type ChatPeer = {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  role?: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  room_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  pending?: boolean;
  failed?: boolean;
};

// Common emoji set
const EMOJIS = [
  "😀","😂","😍","😎","😭","😅","🤔","👍","👎","❤️","🔥","✅",
  "🙏","👋","🎉","😊","🤣","😮","😢","😡","💪","🙌","👀","💯",
  "😏","🥰","😴","🤯","😤","🥺","🤩","🎯","💬","📎","📸","🗂️",
];

function displayName(p: ChatPeer) {
  return p.company_name ?? p.full_name ?? "User";
}

function buildRoomId(a: string, b: string) {
  return `support:${[a, b].sort().join(":")}`;
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(d: string) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

interface ChatRoomProps {
  myId: string;
  peer: ChatPeer;
  onBack?: () => void;
  showHeader?: boolean;
  className?: string;
}

export default function ChatRoom({ myId, peer, onBack, showHeader = true, className = "" }: ChatRoomProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { notify } = useChatNotifications();

  const room = buildRoomId(myId, peer.user_id);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, room_id, content, created_at, is_read, attachment_url, attachment_type, attachment_name")
      .eq("room_id", room)
      .order("created_at", { ascending: true });
    const msgs = (data as Message[]) ?? [];
    setMessages(msgs);
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("room_id", room)
      .eq("receiver_id", myId)
      .eq("is_read", false);
  }, [room, myId, supabase]);

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`chat-${room}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${room}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const tempIdx = prev.findIndex(
              (m) => m.pending && m.sender_id === msg.sender_id && m.content === msg.content
            );
            if (tempIdx >= 0) {
              const next = prev.slice();
              next[tempIdx] = msg;
              return next;
            }
            return [...prev, msg];
          });
          if (msg.sender_id !== myId) {
            notify(displayName(peer), msg.content || (msg.attachment_type === "image" ? "📸 Photo" : "📎 File"));
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then(() => {});
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `room_id=eq.${room}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room, myId, supabase, loadMessages, notify, peer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Upload file to Supabase Storage
  async function uploadFile(file: File): Promise<{ url: string; type: string; name: string } | null> {
    const ext = file.name.split(".").pop();
    const path = `${myId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file, { upsert: false });
    if (error) { console.error("Upload error", error); return null; }
    const { data: { publicUrl } } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    const type = file.type.startsWith("image/") ? "image" : "file";
    return { url: publicUrl, type, name: file.name };
  }

  // Core send: text, optional attachment
  async function sendMessage(attachmentOverride?: { url: string; type: string; name: string } | null) {
    const text = input.trim();
    const attachment = attachmentOverride ?? null;
    if (!text && !attachment) return;
    if (sending || uploading) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: myId,
      receiver_id: peer.user_id,
      room_id: room,
      content: text,
      created_at: new Date().toISOString(),
      is_read: false,
      attachment_url: attachment?.url ?? null,
      attachment_type: attachment?.type ?? null,
      attachment_name: attachment?.name ?? null,
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setPendingFile(null);
    setPreview(null);
    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: myId,
        receiver_id: peer.user_id,
        room_id: room,
        content: text,
        attachment_url: attachment?.url ?? null,
        attachment_type: attachment?.type ?? null,
        attachment_name: attachment?.name ?? null,
      })
      .select("id, sender_id, receiver_id, room_id, content, created_at, is_read, attachment_url, attachment_type, attachment_name")
      .single();

    if (error || !data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
    } else {
      setMessages((prev) => {
        const realExists = prev.some((m) => m.id === (data as Message).id);
        if (realExists) return prev.filter((m) => m.id !== tempId);
        return prev.map((m) => (m.id === tempId ? (data as Message) : m));
      });
    }
    setSending(false);
  }

  // Handle file picked from input
  async function handleFilePicked(file: File) {
    const isImage = file.type.startsWith("image/");
    const objectUrl = URL.createObjectURL(file);
    setPreview({ url: isImage ? objectUrl : "", type: isImage ? "image" : "file", name: file.name });
    setPendingFile(file);
    setShowEmoji(false);
  }

  // Send pending file
  async function sendPendingFile() {
    if (!pendingFile) return;
    setUploading(true);
    const attachment = await uploadFile(pendingFile);
    setUploading(false);
    if (!attachment) return;
    await sendMessage(attachment);
  }

  function insertEmoji(emoji: string) {
    const el = inputRef.current;
    if (!el) { setInput((v) => v + emoji); return; }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }

  // Group messages by date
  const grouped: Array<{ date: string; items: Message[] }> = [];
  for (const m of messages) {
    const label = formatDateLabel(m.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === label) last.items.push(m);
    else grouped.push({ date: label, items: [m] });
  }

  const initial = displayName(peer).charAt(0).toUpperCase();

  return (
    <div className={`flex flex-col h-full bg-[#efeae2] ${className}`} onClick={() => setShowEmoji(false)}>
      {showHeader && (
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow flex-shrink-0">
          {onBack && (
            <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{displayName(peer)}</p>
            {peer.role && <p className="text-xs text-white/70 capitalize">{peer.role}</p>}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-sm text-neutral-500 mt-12">
            <p>No messages yet. Send a message to start.</p>
          </div>
        )}
        {grouped.map((group) => (
          <div key={group.date} className="space-y-1">
            <div className="flex justify-center my-3">
              <span className="bg-white/80 text-[11px] text-neutral-600 px-3 py-1 rounded-full shadow-sm">
                {group.date}
              </span>
            </div>
            {group.items.map((msg, idx) => {
              const isMine = msg.sender_id === myId;
              const prev = group.items[idx - 1];
              const tail = !prev || prev.sender_id !== msg.sender_id;
              const hasAttachment = !!msg.attachment_url;
              const isImage = msg.attachment_type === "image";
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} px-1`}>
                  <div
                    className={[
                      "max-w-[80%] text-sm shadow-sm overflow-hidden",
                      isMine ? "bg-[#dcf8c6] text-neutral-900" : "bg-white text-neutral-900",
                      tail
                        ? isMine ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"
                        : "rounded-2xl",
                      "mt-0.5",
                      hasAttachment ? "p-0" : "px-2.5 py-1.5",
                    ].join(" ")}
                  >
                    {/* Image attachment */}
                    {hasAttachment && isImage && (
                      <div className="relative">
                        <a href={msg.attachment_url!} target="_blank" rel="noopener noreferrer">
                          <img
                            src={msg.attachment_url!}
                            alt="attachment"
                            className="max-w-[240px] w-full rounded-xl object-cover cursor-pointer"
                            style={{ maxHeight: 220 }}
                          />
                        </a>
                        {msg.content && (
                          <p className="px-2.5 py-1 text-sm whitespace-pre-wrap break-words pb-5">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    )}

                    {/* File attachment */}
                    {hasAttachment && !isImage && (
                      <a
                        href={msg.attachment_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={msg.attachment_name ?? true}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 transition"
                      >
                        <div className="w-9 h-9 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {msg.attachment_name ?? "File"}
                          </p>
                          <p className="text-xs text-neutral-400">Tap to download</p>
                        </div>
                        <Download className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      </a>
                    )}

                    {/* Text-only message */}
                    {!hasAttachment && (
                      <p className="whitespace-pre-wrap break-words pr-12">{msg.content}</p>
                    )}

                    {/* Timestamp + ticks */}
                    <div className={`flex justify-end items-center gap-0.5 text-[10px] text-neutral-500 ${hasAttachment ? "px-2 pb-1 mt-0.5" : "absolute right-2 bottom-1"} relative`}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isMine &&
                        (msg.failed ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : msg.pending ? (
                          <Clock className="w-3 h-3 text-neutral-400" />
                        ) : msg.is_read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div
          className="absolute bottom-20 left-2 right-2 md:left-auto md:right-4 md:w-80 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 z-20 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {EMOJIS.map((em) => (
            <button
              key={em}
              onClick={() => { insertEmoji(em); }}
              className="text-2xl hover:bg-neutral-100 rounded-lg w-10 h-10 flex items-center justify-center transition"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* File preview bar */}
      {preview && (
        <div className="bg-white border-t border-neutral-200 px-3 py-2 flex items-center gap-3 flex-shrink-0">
          {preview.type === "image" ? (
            <img src={preview.url} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
          ) : (
            <div className="w-14 h-14 bg-neutral-100 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7 text-neutral-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{preview.name}</p>
            <p className="text-xs text-neutral-400">{preview.type === "image" ? "Image" : "File"} ready to send</p>
          </div>
          <button
            onClick={() => { setPreview(null); setPendingFile(null); }}
            className="p-1 hover:bg-neutral-100 rounded-full"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
          <button
            onClick={sendPendingFile}
            disabled={uploading}
            className="px-4 py-1.5 bg-[#075e54] text-white text-sm rounded-full hover:bg-[#054d44] transition disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Send"}
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-[#f0f0f0] px-2 py-2 flex items-center gap-2 flex-shrink-0 relative">
        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFilePicked(e.target.files[0])}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFilePicked(e.target.files[0])}
        />

        {/* Emoji button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowEmoji((v) => !v); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-neutral-200 rounded-full transition flex-shrink-0"
          aria-label="Emoji"
        >
          <Smile className="w-5 h-5 text-neutral-500" />
        </button>

        {/* Attach buttons */}
        <button
          onClick={() => imageInputRef.current?.click()}
          className="w-9 h-9 flex items-center justify-center hover:bg-neutral-200 rounded-full transition flex-shrink-0"
          aria-label="Send photo"
        >
          <ImageIcon className="w-5 h-5 text-neutral-500" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 flex items-center justify-center hover:bg-neutral-200 rounded-full transition flex-shrink-0"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5 text-neutral-500" />
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (pendingFile) sendPendingFile();
              else sendMessage();
            }
          }}
          placeholder="Type a message"
          className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={() => pendingFile ? sendPendingFile() : sendMessage()}
          disabled={(!input.trim() && !pendingFile) || sending || uploading}
          className="w-11 h-11 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-[#054d44] transition disabled:opacity-50 flex-shrink-0"
          aria-label="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
