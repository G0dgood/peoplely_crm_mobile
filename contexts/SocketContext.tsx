import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (url?: string) => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
};

const defaultValue: SocketContextValue = {
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  on: () => {},
  off: () => {},
};

const SocketContext = createContext<SocketContextValue>(defaultValue);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

type SocketProviderProps = {
  children: React.ReactNode;
  socketUrl?: string;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  socketUrl,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Default socket URL - can be overridden via props or environment variable
  const defaultSocketUrl =
    socketUrl || process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000";

  const connect = (url?: string) => {
    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    if (isConnecting) {
      console.log("Socket connection already in progress");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const connectionUrl = url || defaultSocketUrl;
      const newSocket = io(connectionUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        auth: user
          ? {
              userId: user.id,
              email: user.email,
            }
          : undefined,
      });

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
        setIsConnecting(false);
      });

      newSocket.on("connect_error", (err) => {
        // console.error("Socket connection error:", err);
        setError(err.message || "Connection failed");
        setIsConnecting(false);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        setIsConnected(true);
        setError(null);
      });

      newSocket.on("reconnect_error", (err) => {
        // console.error("Socket reconnection error:", err);
        setError(err.message || "Reconnection failed");
      });

      newSocket.on("reconnect_failed", () => {
        // console.error("Socket reconnection failed");
        setError("Failed to reconnect. Please check your connection.");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (err) {
      // console.error("Error creating socket connection:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    } else {
      console.warn("Socket not initialized. Cannot listen to event:", event);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: SocketContextValue = {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
