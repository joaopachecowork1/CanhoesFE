"use client";

import { useEffect } from "react";
import { useSignalRContext } from "@/contexts/SignalRContext";
import { logger } from "@/lib/logger";

/**
 * Hook to manage event-specific subscriptions on top of a global SignalR connection.
 * It joins the event group on mount and leaves on unmount.
 */
export function useSignalR(eventId: string | null) {
  const { connection, isConnected } = useSignalRContext();

  useEffect(() => {
    if (!connection || !isConnected || !eventId) return;

    const joinGroup = async () => {
      try {
        await connection.invoke("JoinEventGroup", eventId);
        logger.info(`Joined SignalR group: event_${eventId}`);
      } catch (err) {
        logger.error(`Failed to join group event_${eventId}:`, err);
      }
    };

    joinGroup();

    return () => {
      if (connection && isConnected && eventId) {
        connection.invoke("LeaveEventGroup", eventId)
          .catch(err => logger.error(`Error leaving group event_${eventId}:`, err));
      }
    };
  }, [connection, isConnected, eventId]);

  return { connection, isConnected };
}
