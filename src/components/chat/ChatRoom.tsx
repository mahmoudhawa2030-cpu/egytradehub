"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Check, CheckCheck, ArrowLeft } from "lucide-react";
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
};

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
  const bottomRef = useRef<HTMLDivElement>(null);
  const { notify } = useChatNotifications();

  const room = buildRoomId(myId, peer.user_id);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, room_id, content, created_at, is_read")
      .eq("room_id", room)
      .order("created_at", { ascending: true });
    const msgs = (data as Message[]) ?? [];
    setMessages(msgs);
    // Mark received messages as read
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
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.sender_id !== myId) {
            notify(displayName(peer), msg.content);
            // mark as read because user is viewing the chat
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", msg.id)
              .then(() => {});
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
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, myId, supabase, loadMessages, notify, peer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: myId,
      receiver_id: peer.user_id,
      room_id: room,
      content: text,
    });
    if (!error) setInput("");
    setSending(false);
  }

  // Group messages by date for date separators
  const grouped: Array<{ date: string; items: Message[] }> = [];
  for (const m of messages) {
    const label = formatDateLabel(m.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === label) last.items.push(m);
    else grouped.push({ date: label, items: [m] });
  }

  const initial = displayName(peer).charAt(0).toUpperCase();

  return (
    <div className={`flex flex-col h-full bg-[#efeae2] ${className}`}>
      {showHeader && (
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow">
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

      {/* Messages area with WhatsApp pattern background */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='2' cy='2' r='1' fill='%23000' fill-opacity='0.03'/></svg>\")",
        }}
      >
        {messages.length === 0 && (
          <div className="text-center text-sm text-neutral-500 mt-12">
            <p>No messages yet.</p>
            <p>Send a message to start the conversation.</p>
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
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} px-1`}>
                  <div
                    className={[
                      "max-w-[80%] px-2.5 py-1.5 text-sm shadow-sm relative",
                      isMine ? "bg-[#dcf8c6] text-neutral-900" : "bg-white text-neutral-900",
                      tail
                        ? isMine
                          ? "rounded-2xl rounded-tr-sm"
                          : "rounded-2xl rounded-tl-sm"
                        : "rounded-2xl",
                      "mt-0.5",
                    ].join(" ")}
                  >
                    <p className="whitespace-pre-wrap break-words pr-12">{msg.content}</p>
                    <div className="absolute right-2 bottom-1 flex items-center gap-0.5 text-[10px] text-neutral-500">
                      <span>{formatTime(msg.created_at)}</span>
                      {isMine &&
                        (msg.is_read ? (
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

      {/* Input */}
      <div className="bg-[#f0f0f0] px-2 py-2 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message"
          className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm focus:outline-none"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-[#054d44] transition disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
