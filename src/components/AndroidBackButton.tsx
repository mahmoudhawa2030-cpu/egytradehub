"use client";

import { useEffect } from "react";

export default function AndroidBackButton() {
  useEffect(() => {
    let removeListener: (() => void) | null = null;

    async function setup() {
      try {
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
        removeListener = () => handle.remove();
      } catch {
        // Not running in Capacitor (web browser) — do nothing
      }
    }

    setup();

    return () => {
      removeListener?.();
    };
  }, []);

  return null;
}
