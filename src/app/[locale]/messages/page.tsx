"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/context";

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender: { full_name: string | null; company_name: string | null } | null;
};

export default function MessagesPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/${locale}/login`); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("messages")
        .select("id, content, created_at, sender_id, receiver_id, sender:profiles!sender_id(full_name, company_name)")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      setMessages((data as unknown as Message[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase, router, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${locale}/account`} className="p-2 hover:bg-neutral-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Messages</h1>
            <p className="text-sm text-neutral-500">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-[#FF6A00]" />
            </div>
            <h2 className="font-semibold text-neutral-900 mb-1">No messages yet</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Messages with suppliers will appear here.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block px-6 py-2.5 bg-[#FF6A00] text-white font-semibold rounded-xl hover:bg-[#FF8C00] transition"
            >
              Browse Suppliers
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === userId;
              const sender = msg.sender;
              const senderName = sender?.company_name ?? sender?.full_name ?? "Unknown";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 px-6 py-4 ${
                    i < messages.length - 1 ? "border-b border-neutral-100" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF6A00] text-xs font-bold">
                      {isMine ? "Me" : senderName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {isMine ? "You" : senderName}
                      </p>
                      <p className="text-xs text-neutral-400 flex-shrink-0">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">{msg.content}</p>
                  </div>
                  {isMine && (
                    <Send className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
