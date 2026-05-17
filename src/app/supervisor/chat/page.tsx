"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConversationsList from "@/components/chat/ConversationsList";
import ChatRoom, { type ChatPeer } from "@/components/chat/ChatRoom";

export default function SupervisorChatPage() {
  const supabase = createClient();
  const [myId, setMyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ChatPeer | null>(null);

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
        <p className="text-sm text-neutral-500">Reply to buyers and suppliers in real-time</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-neutral-200">
          <ConversationsList
            myId={myId}
            selectedId={selected?.user_id ?? null}
            onSelect={(p) => setSelected(p)}
            showAllUsers
          />
        </aside>
        <section className="flex-1 flex flex-col">
          {selected ? (
            <ChatRoom myId={myId} peer={selected} showHeader />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">Select a user to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
