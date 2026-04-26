"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { logger } from "@/lib/logger";

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
});

export const useSignalRContext = () => useContext(SignalRContext);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isConnecting = useRef(false);

  useEffect(() => {
    if (connection || isConnecting.current) return;

    const hubUrl = `${process.env.NEXT_PUBLIC_CANHOES_API_URL || "http://localhost:5000"}/hubs/event`;
    
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    const start = async () => {
      isConnecting.current = true;
      try {
        await newConnection.start();
        logger.info("SignalR Global Connection Started.");
        setIsConnected(true);
        setConnection(newConnection);
      } catch (err) {
        logger.error("SignalR Global Connection Failed:", err);
        setTimeout(start, 5000);
      } finally {
        isConnecting.current = false;
      }
    };

    start();

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
}
