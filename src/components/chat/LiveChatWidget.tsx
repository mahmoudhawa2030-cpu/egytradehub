"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ChatRoom, { type ChatPeer } from "./ChatRoom";
import { useChatNotifications } from "./useChatNotifications";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [supportPeer, setSupportPeer] = useState<ChatPeer | null>(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const { notify } = useChatNotifications();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(u);
      if (u) {
        // Find an admin/supervisor to chat with
        const { data: admins } = await supabase
          .from("profiles")
          .select("user_id, full_name, company_name, role")
          .in("role", ["admin", "supervisor"])
          .limit(1);
        if (admins && admins.length > 0) {
          setSupportPeer({
            user_id: admins[0].user_id,
            full_name: admins[0].full_name,
            company_name: admins[0].company_name ?? "Support Team",
            role: admins[0].role,
          });
        }

        // Count unread messages
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", u.id)
          .eq("is_read", false);
        if (mounted) setUnread(count ?? 0);

        // Subscribe to incoming messages for badge + sound
        channel = supabase
          .channel(`livechat-${u.id}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${u.id}` },
            (payload) => {
              const m = payload.new as { content: string };
              setUnread((n) => n + 1);
              if (!isOpen) notify("New message", m.content);
            }
          )
          .subscribe();
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset unread when opened
  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  if (loading) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        aria-label="Open live chat"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <span className="font-medium text-sm">Live Chat</span>
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-96 h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Live Support</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Online now
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition p-1"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-[#FF6A00]" />
              </div>
              <h4 className="font-semibold text-neutral-800 mb-2">Start a Conversation</h4>
              <p className="text-neutral-600 text-sm mb-4">
                Sign in to chat with our support team
              </p>
              <Link
                href="/en/login?redirect=/en/messages"
                className="inline-block bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white px-6 py-2 rounded-lg font-medium hover:shadow-md transition"
              >
                Sign In to Chat
              </Link>
            </div>
          ) : !supportPeer ? (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm p-6 text-center">
              No support team available right now. Please try again later.
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <ChatRoom myId={user.id} peer={supportPeer} showHeader={false} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
