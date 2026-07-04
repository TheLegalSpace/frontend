import { io, Socket } from "socket.io-client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://legalspace.onrender.com";

let socket: Socket | null = null;
let socketToken: string | null = null;
let debugListenersBound = false;

export function connectSocket(token: string): Socket {
  if (!socket) {
    socket = io(BASE_URL, {
      path: "/realtime",
      transports: ["polling", "websocket"],
      autoConnect: false,
      auth: { token },
    });
  }

  if (token && socketToken !== token) {
    socket.auth = { token };
    socketToken = token;
  }

  if (!debugListenersBound) {
    socket.on("connect_error", (err: Error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("Socket error:", err.message);
      }
    });
    debugListenersBound = true;
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function refreshSocketAuth(token: string) {
  if (!socket) return;
  socket.auth = { token };
  socketToken = token;
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
  debugListenersBound = false;
}
