import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { STORAGE_KEYS } from "../constants";

const INACTIVITY_TIME = 15 * 60 * 1000; // 15 min

export function useInactivityLogout() {
  const { logout } = useAuth();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateLastActivity = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  };

  const resetTimer = () => {
    updateLastActivity();

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const lastActivity = Number(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY));

      if (Date.now() - lastActivity >= INACTIVITY_TIME) {
        logout();
      }
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
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
  }, []);
}