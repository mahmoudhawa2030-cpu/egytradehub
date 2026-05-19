"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AllRoomsList, { type RoomSummary } from "@/components/chat/AllRoomsList";
import ChatRoom, { type ChatPeer } from "@/components/chat/ChatRoom";

export default function SupervisorChatPage() {
  const supabase = createClient();
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomSummary | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setMyId(user.id);
    })();
  }, [supabase]);

  if (!myId) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-neutral-200 bg-white">
        <h1 className="text-xl font-bold text-neutral-900">Live Chat Support</h1>
        <p className="text-sm text-neutral-500">Monitor and reply to every conversation across the platform</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-neutral-200">
          <AllRoomsList
            myId={myId}
            selectedRoomId={selectedRoom?.room_id ?? null}
            onSelect={(r) => setSelectedRoom(r)}
          />
        </aside>
        <section className="flex-1 flex flex-col">
          {selectedRoom ? (() => {
            // Address replies to the participant who is NOT the supervisor (myId).
            // If supervisor is not part of the room, default to participant_a.
            const targetId =
              selectedRoom.participant_a === myId
                ? selectedRoom.participant_b
                : selectedRoom.participant_a;
            const targetName =
              targetId === selectedRoom.participant_a
                ? selectedRoom.a_name
                : selectedRoom.b_name;
            const targetRole =
              targetId === selectedRoom.participant_a
                ? selectedRoom.a_role
                : selectedRoom.b_role;
            const peer: ChatPeer = {
              user_id: targetId,
              full_name: targetName,
              company_name: null,
              role: targetRole,
            };
            return (
              <ChatRoom
                key={selectedRoom.room_id}
                myId={myId}
                peer={peer}
                roomOverride={selectedRoom.room_id}
                showHeader
              />
            );
          })() : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">Select a conversation to take over</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
