"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useChatNotifications } from "./useChatNotifications";

export type ChatConversation = {
  peer_id: string;
  peer_name: string;
  peer_role: string;
  last_message: string;
  last_at: string;
  unread: number;
};

interface Props {
  myId: string;
  onSelect: (peer: { user_id: string; full_name: string | null; company_name: string | null; role?: string }) => void;
  selectedId?: string | null;
  /** When true, also fetches all chat-eligible users with no conversation yet (for admin/supervisor) */
  showAllUsers?: boolean;
}

type ProfileLite = { user_id: string; full_name: string | null; company_name: string | null; role: string };

export default function ConversationsList({ myId, onSelect, selectedId, showAllUsers = false }: Props) {
  const supabase = createClient();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [allUsers, setAllUsers] = useState<ProfileLite[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { notify } = useChatNotifications();

  const load = useCallback(async () => {
    // Fetch all messages where I'm sender or receiver
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, created_at, is_read")
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order("created_at", { ascending: false });

    const list = (msgs ?? []) as Array<{
      id: string;
      sender_id: string;
      receiver_id: string;
      content: string;
      created_at: string;
      is_read: boolean;
    }>;

    const peers: Record<string, ChatConversation> = {};
    for (const m of list) {
      const peer = m.sender_id === myId ? m.receiver_id : m.sender_id;
      if (!peers[peer]) {
        peers[peer] = {
          peer_id: peer,
          peer_name: "",
          peer_role: "",
          last_message: m.content,
          last_at: m.created_at,
          unread: 0,
        };
      }
      if (m.receiver_id === myId && !m.is_read) {
        peers[peer].unread += 1;
      }
    }

    const peerIds = Object.keys(peers);
    if (peerIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, role")
        .in("user_id", peerIds);
      for (const p of (profs ?? []) as ProfileLite[]) {
        if (peers[p.user_id]) {
          peers[p.user_id].peer_name = p.company_name ?? p.full_name ?? "User";
          peers[p.user_id].peer_role = p.role;
        }
      }
    }

    const sorted = Object.values(peers).sort(
      (a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime()
    );
    setConversations(sorted);

    if (showAllUsers) {
      const { data: users } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, role")
        .neq("user_id", myId)
        .order("full_name", { ascending: true });
      setAllUsers((users ?? []) as ProfileLite[]);
    }

    setLoading(false);
  }, [myId, supabase, showAllUsers]);

  useEffect(() => {
    load();
    // Listen for any new message I'm involved in to refresh list + notify
    const channel = supabase
      .channel(`conversations-${myId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as { sender_id: string; receiver_id: string; content: string };
          if (m.sender_id === myId || m.receiver_id === myId) {
            load();
            if (m.receiver_id === myId) {
              notify("New message", m.content);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, myId, supabase, notify]);

  const q = search.trim().toLowerCase();
  const filteredConvs = conversations.filter((c) => c.peer_name.toLowerCase().includes(q));
  const peersInConvs = new Set(conversations.map((c) => c.peer_id));
  const filteredOthers = allUsers
    .filter((u) => !peersInConvs.has(u.user_id))
    .filter((u) => (u.company_name ?? u.full_name ?? "").toLowerCase().includes(q));

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-neutral-100 sticky top-0 bg-white z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#075e54]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-6 text-sm text-neutral-400 text-center">Loading...</p>}
        {!loading && filteredConvs.length === 0 && filteredOthers.length === 0 && (
          <p className="p-6 text-sm text-neutral-400 text-center">No conversations yet</p>
        )}

        {filteredConvs.map((c) => (
          <button
            key={c.peer_id}
            onClick={() =>
              onSelect({
                user_id: c.peer_id,
                full_name: c.peer_name,
                company_name: null,
                role: c.peer_role,
              })
            }
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition border-b border-neutral-50 ${
              selectedId === c.peer_id ? "bg-neutral-100" : ""
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-[#075e54] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {c.peer_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-900 truncate">{c.peer_name}</p>
                <span className="text-[10px] text-neutral-400 flex-shrink-0">
                  {new Date(c.last_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-xs text-neutral-500 truncate">{c.last_message}</p>
                {c.unread > 0 && (
                  <span className="bg-[#25d366] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center flex-shrink-0">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {showAllUsers && filteredOthers.length > 0 && (
          <>
            <div className="px-4 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wide bg-neutral-50">
              All Users
            </div>
            {filteredOthers.map((u) => {
              const name = u.company_name ?? u.full_name ?? "User";
              return (
                <button
                  key={u.user_id}
                  onClick={() => onSelect(u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition border-b border-neutral-50 ${
                    selectedId === u.user_id ? "bg-neutral-100" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
                    <p className="text-xs text-neutral-400 capitalize">{u.role}</p>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
