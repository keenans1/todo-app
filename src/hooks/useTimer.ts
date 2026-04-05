import { useState, useRef, useEffect } from "react";

export function useTimer() {
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setTimerRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning]);

  function startTimer(id: number, durationMinutes: number) {
    setActiveTimerId(id);
    setRemainingSeconds((prev) => (prev > 0 ? prev : durationMinutes * 60));
    setTimerRunning(true);
  }

  function pauseTimer() {
    setTimerRunning(false);
  }

  function resumeTimer() {
    setTimerRunning(true);
  }

  function stopTimer() {
    setTimerRunning(false);
    setActiveTimerId(null);
    setRemainingSeconds(0);
  }

  function clearTimerForId(id: number) {
    if (activeTimerId === id) {
      stopTimer();
    }
  }

  return {
    activeTimerId,
    remainingSeconds,
    timerRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    clearTimerForId,
  };
}
