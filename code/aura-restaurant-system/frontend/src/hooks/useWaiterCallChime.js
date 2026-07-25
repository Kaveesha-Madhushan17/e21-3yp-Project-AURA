import { useEffect, useRef } from 'react';
import { playWaiterCallSound } from '../utils/notificationSound';

/**
 * Plays the waiter-call chime whenever a new call is added to the list.
 * Nothing fancy — no persistence, no dedup, no autoplay-retry queueing.
 */
export function useWaiterCallChime(waiterCalls) {
  const prevCountRef = useRef(waiterCalls.length);

  useEffect(() => {
    if (waiterCalls.length > prevCountRef.current) {
      playWaiterCallSound();
    }
    prevCountRef.current = waiterCalls.length;
  }, [waiterCalls]);
}

export default useWaiterCallChime;
