"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Plays a short notification beep using Web Audio API
 * and shows a browser notification (if permission granted).
 */
export function useChatNotifications() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;

      // WhatsApp-like two-tone beep
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(880, 0, 0.12);
      playTone(1320, 0.13, 0.18);
    } catch {
      /* ignore */
    }
  }, []);

  const showBrowserNotification = useCallback((title: string, body: string) => {
    try {
      if (typeof window === "undefined") return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      // Only show if document is hidden / blurred
      if (document.visibilityState === "visible" && document.hasFocus()) return;
      const n = new Notification(title, { body, icon: "/favicon.ico", tag: "egytradehub-chat" });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      /* ignore */
    }
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      playSound();
      showBrowserNotification(title, body);
    },
    [playSound, showBrowserNotification]
  );

  return { notify, playSound, showBrowserNotification };
}
