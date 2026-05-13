"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsSending(true);
    setError(null);
    const supabase = createClient();

    try {
      // Find an admin/supervisor to send message to
      const { data: admins, error: adminError } = await supabase
        .from("profiles")
        .select("user_id")
        .in("role", ["admin", "supervisor"])
        .limit(1);

      if (adminError) {
        console.error("Error finding admin:", adminError);
        setError("Could not find support team. Please try again.");
        setIsSending(false);
        return;
      }

      if (!admins || admins.length === 0) {
        setError("No support team available right now.");
        setIsSending(false);
        return;
      }

      const adminId = admins[0].user_id;

      // Generate room_id (sorted UUIDs to ensure consistency between users)
      const sortedIds = [user.id, adminId].sort();
      const roomId = `user:${sortedIds[0]}:${sortedIds[1]}`;

      // Send message using existing messages table schema
      const { error: msgError } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: adminId,
        room_id: roomId,
        content: message.trim(),
      });

      if (msgError) {
        console.error("Error sending message:", msgError);
        setError(`Failed to send: ${msgError.message}`);
        setIsSending(false);
        return;
      }

      setSent(true);
      setMessage("");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    }

    setIsSending(false);
  };

  if (loading) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          {/* Live indicator dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="font-medium text-sm">Live Chat</span>
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#FF6A00]" />
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-neutral-50 min-h-[200px] max-h-[300px] overflow-y-auto">
            {!user ? (
              /* Not logged in */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            ) : sent ? (
              /* Message sent */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-neutral-800 mb-2">Message Sent!</h4>
                <p className="text-neutral-600 text-sm mb-4">
                  Our team will reply shortly. Check your messages.
                </p>
                <Link
                  href="/en/messages"
                  className="inline-block text-[#FF6A00] font-medium hover:underline"
                >
                  Go to Messages →
                </Link>
              </div>
            ) : (
              /* Chat form */
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
                  <p className="text-sm text-neutral-600">
                    👋 Hi there! How can we help you today?
                  </p>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSend} className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] resize-none h-24 text-sm"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || isSending}
                    className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-neutral-100 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-500">
              Messages are answered by our admin team
            </p>
          </div>
        </div>
      )}
    </>
  );
}
