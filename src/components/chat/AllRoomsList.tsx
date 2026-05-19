"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useChatNotifications } from "./useChatNotifications";

export type RoomSummary = {
  room_id: string;
  participant_a: string;
  participant_b: string;
  a_name: string;
  a_role: string;
  b_name: string;
  b_role: string;
  last_message: string;
  last_at: string;
  unread: number;
};

interface Props {
  myId: string;
  selectedRoomId?: string | null;
  onSelect: (room: RoomSummary) => void;
}

type ProfileLite = { user_id: string; full_name: string | null; company_name: string | null; role: string };

export default function AllRoomsList({ myId, selectedRoomId, onSelect }: Props) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { notify } = useChatNotifications();

  const load = useCallback(async () => {
    // Supervisor RLS allows reading every message.
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, room_id, content, created_at, is_read")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[AllRoomsList] messages query error:", error);
    } else {
      // eslint-disable-next-line no-console
      console.log("[AllRoomsList] loaded", msgs?.length ?? 0, "messages");
    }

    const list = (msgs ?? []) as Array<{
      id: string;
      sender_id: string;
      receiver_id: string;
      room_id: string;
      content: string;
      created_at: string;
      is_read: boolean;
    }>;

    // Group by room_id; keep latest message and capture the two original participants.
    const byRoom: Record<string, RoomSummary> = {};
    const userIds = new Set<string>();
    for (const m of list) {
      if (!m.room_id) continue;
      if (!byRoom[m.room_id]) {
        byRoom[m.room_id] = {
          room_id: m.room_id,
          participant_a: m.sender_id,
          participant_b: m.receiver_id,
          a_name: "",
          a_role: "",
          b_name: "",
          b_role: "",
          last_message: m.content,
          last_at: m.created_at,
          unread: 0,
        };
      }
      // Track the earliest pair encountered, but ensure we keep two distinct ids.
      const r = byRoom[m.room_id];
      if (r.participant_a === r.participant_b) {
        r.participant_b = m.sender_id !== r.participant_a ? m.sender_id : m.receiver_id;
      }
      userIds.add(m.sender_id);
      if (m.receiver_id) userIds.add(m.receiver_id);
      if (m.receiver_id === myId && !m.is_read) r.unread += 1;
    }

    const ids = Array.from(userIds);
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, role")
        .in("user_id", ids);
      const map = new Map<string, ProfileLite>();
      for (const p of (profs ?? []) as ProfileLite[]) map.set(p.user_id, p);
      for (const r of Object.values(byRoom)) {
        const a = map.get(r.participant_a);
        const b = map.get(r.participant_b);
        r.a_name = a?.company_name ?? a?.full_name ?? "User";
        r.a_role = a?.role ?? "";
        r.b_name = b?.company_name ?? b?.full_name ?? "User";
        r.b_role = b?.role ?? "";
      }
    }

    const sorted = Object.values(byRoom).sort(
      (x, y) => new Date(y.last_at).getTime() - new Date(x.last_at).getTime()
    );
    setRooms(sorted);
    setLoading(false);
  }, [supabase, myId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`all-rooms-${myId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as { sender_id: string; content: string };
          load();
          if (m.sender_id !== myId) notify("New support message", m.content);
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
  }, [load, supabase, myId, notify]);

  const q = search.trim().toLowerCase();
  const filtered = rooms.filter(
    (r) =>
      r.a_name.toLowerCase().includes(q) ||
      r.b_name.toLowerCase().includes(q) ||
      r.last_message.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-neutral-100 sticky top-0 bg-white z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all conversations..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#075e54]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-6 text-sm text-neutral-400 text-center">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <p className="p-6 text-sm text-neutral-400 text-center">No conversations</p>
        )}

        {filtered.map((r) => {
          const title = `${r.a_name} ↔ ${r.b_name}`;
          return (
            <button
              key={r.room_id}
              onClick={() => onSelect(r)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition border-b border-neutral-50 ${
                selectedRoomId === r.room_id ? "bg-neutral-100" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#075e54] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {r.a_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{title}</p>
                  <span className="text-[10px] text-neutral-400 flex-shrink-0">
                    {new Date(r.last_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-neutral-500 truncate">{r.last_message}</p>
                  {r.unread > 0 && (
                    <span className="bg-[#25d366] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center flex-shrink-0">
                      {r.unread}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 capitalize mt-0.5 truncate">
                  {r.a_role}{r.b_role ? ` · ${r.b_role}` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
