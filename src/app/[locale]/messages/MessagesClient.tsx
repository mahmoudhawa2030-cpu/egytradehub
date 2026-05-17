"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConversationsList from "@/components/chat/ConversationsList";
import ChatRoom, { type ChatPeer } from "@/components/chat/ChatRoom";

export default function MessagesClient({ locale }: { locale: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [myId, setMyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ChatPeer | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/${locale}/login`);
        return;
      }
      setMyId(user.id);
    })();
  }, [supabase, router, locale]);

  if (!myId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#075e54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white md:flex-row">
      {/* Mobile: show list OR chat. Desktop: show both. */}
      <aside
        className={`${selected ? "hidden md:flex" : "flex"} md:w-80 md:border-r md:border-neutral-200 flex-col h-full`}
      >
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shadow">
          <Link href={`/${locale}/account`} className="p-1 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">Chats</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationsList
            myId={myId}
            selectedId={selected?.user_id ?? null}
            onSelect={(peer) => setSelected(peer)}
          />
        </div>
      </aside>

      <section className={`${selected ? "flex" : "hidden md:flex"} flex-1 flex-col h-full`}>
        {selected ? (
          <ChatRoom myId={myId} peer={selected} onBack={() => setSelected(null)} />
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-neutral-400">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </section>
    </div>
  );
}
