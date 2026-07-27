"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { logger } from "@/lib/logger";

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  connect: () => void;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
  connect: () => {},
});

export const useSignalRContext = () => useContext(SignalRContext);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const isConnecting = useRef(false);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    setShouldConnect(true);
  }, []);

  useEffect(() => {
    if (!shouldConnect || connection || isConnecting.current) return;

    let cancelled = false;

    const startConnection = async () => {
      isConnecting.current = true;
      try {
        const signalR = await import("@microsoft/signalr");

        const hubUrl = `${process.env.NEXT_PUBLIC_CANHOES_API_URL || "http://localhost:3000"}/hubs/event`;

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        await newConnection.start();
        if (cancelled) {
          await newConnection.stop();
          return;
        }
        logger.info("SignalR Global Connection Started.");
        setIsConnected(true);
        setConnection(newConnection);
        retryCount.current = 0;
      } catch (err) {
        logger.error("SignalR Global Connection Failed:", err);
        if (!cancelled) {
          const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
          retryCount.current++;
          setTimeout(startConnection, delay);
        }
      } finally {
        isConnecting.current = false;
      }
    };

    startConnection();

    return () => {
      cancelled = true;
    };
  }, [shouldConnect, connection]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected, connect }}>
      {children}
    </SignalRContext.Provider>
  );
}
