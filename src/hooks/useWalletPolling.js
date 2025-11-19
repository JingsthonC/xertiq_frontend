import { useCallback, useEffect, useRef, useState } from "react";
import useWalletStore from "../store/wallet";

const DEFAULT_INTERVAL = 4000;
const DEFAULT_MAX_ATTEMPTS = 6;

const useWalletPolling = ({
  enabled = false,
  interval = DEFAULT_INTERVAL,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
} = {}) => {
  const { fetchCredits } = useWalletStore();
  const [status, setStatus] = useState("idle");
  const [attempts, setAttempts] = useState(0);
  const [lastCredits, setLastCredits] = useState(null);
  const timerRef = useRef(null);
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const poll = useCallback(async () => {
    try {
      setStatus("polling");
      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);

      const credits = await fetchCredits();
      setLastCredits(credits);

      if (typeof credits === "number") {
        setStatus("synced");
        stopPolling();
        return;
      }

      if (attemptsRef.current >= maxAttempts) {
        setStatus("timeout");
        stopPolling();
        return;
      }

      timerRef.current = setTimeout(poll, interval);
    } catch (err) {
      console.error("Wallet polling failed", err);
      setStatus("error");
      stopPolling();
    }
  }, [fetchCredits, interval, maxAttempts, stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    attemptsRef.current = 0;
    setAttempts(0);
    setLastCredits(null);
    setStatus("polling");
    poll();
  }, [poll, stopPolling]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    }

    return () => stopPolling();
  }, [enabled, startPolling, stopPolling]);

  return {
    status,
    attempts,
    lastCredits,
    startPolling,
    stopPolling,
    isPolling: status === "polling",
  };
};

export default useWalletPolling;
