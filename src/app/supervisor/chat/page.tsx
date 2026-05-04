"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Search, MessageSquare, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = { user_id: string; full_name: string | null; company_name: string | null; role: string };
type Message = { id: string; sender_id: string; content: string; created_at: string; is_read: boolean };

function displayName(p: Profile) {
  return p.company_name ?? p.full_name ?? "Unknown";
}

export default function SupervisorChatPage() {
  const supabase = createClient();
  const [myId, setMyId] = useState<string | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const roomId = (a: string, b: string) =>
    ["support", [a, b].sort().join(":")].join(":");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, role")
        .not("role", "in", '("admin","supervisor")')
        .order("full_name");
      setUsers((data as Profile[]) ?? []);
      setFiltered((data as Profile[]) ?? []);
    }
    init();
  }, [supabase]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter((u) => displayName(u).toLowerCase().includes(q)));
  }, [search, users]);

  const loadMessages = useCallback(async (profile: Profile) => {
    if (!myId) return;
    const room = roomId(myId, profile.user_id);
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at, is_read")
      .eq("room_id", room)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
    await supabase.from("messages").update({ is_read: true }).eq("room_id", room).neq("sender_id", myId);
  }, [myId, supabase]);

  useEffect(() => {
    if (!selected || !myId) return;
    loadMessages(selected);
    const room = roomId(myId, selected.user_id);
    const channel = supabase
      .channel(`chat-${room}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${room}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected, myId, loadMessages, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !selected || !myId || sending) return;
    setSending(true);
    const room = roomId(myId, selected.user_id);
    await supabase.from("messages").insert({
      sender_id: myId,
      receiver_id: selected.user_id,
      room_id: room,
      content: input.trim(),
    });
    setInput("");
    setSending(false);
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 border-b border-neutral-200 bg-white">
        <h1 className="text-xl font-bold text-neutral-900">Live Chat Support</h1>
        <p className="text-sm text-neutral-500">Reply to buyers and suppliers in real-time</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* User List */}
        <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col">
          <div className="p-3 border-b border-neutral-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-6 text-sm text-neutral-400 text-center">No users found</p>
            )}
            {filtered.map((u) => (
              <button
                key={u.user_id}
                onClick={() => setSelected(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition border-b border-neutral-50 ${
                  selected?.user_id === u.user_id ? "bg-blue-50 border-blue-100" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 text-xs font-bold">{displayName(u).charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{displayName(u)}</p>
                  <p className="text-xs text-neutral-400 capitalize">{u.role}</p>
                </div>
                <Circle className="w-2 h-2 text-green-400 fill-green-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-neutral-50">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">Select a user to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 text-sm font-bold">{displayName(selected).charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{displayName(selected)}</p>
                  <p className="text-xs text-neutral-400 capitalize">{selected.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-neutral-400 mt-8">No messages yet. Start the conversation.</p>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender_id === myId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm"
                        }`}
                      >
                        {!isMine && (
                          <p className="text-xs font-semibold text-blue-600 mb-1">{displayName(selected)}</p>
                        )}
                        {isMine && (
                          <p className="text-xs text-blue-200 mb-1">Support</p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-neutral-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-neutral-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder={`Reply to ${displayName(selected)}...`}
                    className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
