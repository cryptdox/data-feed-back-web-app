import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { STORAGE_KEYS } from "../constants";

const INACTIVITY_TIME = 15 * 60 * 1000; // 15 mnt

export function useInactivityLogout() {
  const { handleLogout, isAuthenticated } = useAuth();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateLastActivity = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  };

  const resetTimer = () => {
    if (!isAuthenticated) return;

    updateLastActivity();

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const lastActivity = Number(
        localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)
      );

      if (Date.now() - lastActivity >= INACTIVITY_TIME) {
        if (timer.current) clearTimeout(timer.current);
        handleLogout();
      }
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "scroll", "click"];

    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LAST_ACTIVITY) {
        resetTimer();
      }
    };

    events.forEach((event) => window.addEventListener(event, resetTimer));
    window.addEventListener("storage", storageHandler);

    resetTimer();

    return () => {
      if (timer.current) clearTimeout(timer.current);

      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );

      window.removeEventListener("storage", storageHandler);
    };
  }, [isAuthenticated]);
}