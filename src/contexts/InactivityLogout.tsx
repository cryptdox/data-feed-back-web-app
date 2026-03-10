import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const INACTIVITY_TIME = 15 * 60 * 1000; // 15 min

export function useInactivityLogout() {
  const { logout } = useAuth();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateLastActivity = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  const resetTimer = () => {
    updateLastActivity();

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const lastActivity = Number(localStorage.getItem("lastActivity"));

      if (Date.now() - lastActivity >= INACTIVITY_TIME) {
        logout();
      }
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "lastActivity") {
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