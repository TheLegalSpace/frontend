import { io, Socket } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

let socket: Socket | null = null;
let socketToken: string | null = null;
let debugListenersBound = false;

export function connectSocket(token: string): Socket {
  if (!BASE_URL) {
    throw new Error("Error in configuration: URL is not defined");
  }

  if (!socket) {
    socket = io(BASE_URL, {
      path: "/realtime",
      transports: ["polling", "websocket"],
      autoConnect: false,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
      upgrade: false,
    });
  }

  if (token && socketToken !== token) {
    socket.auth = { token };
    socketToken = token;
  }

  if (!debugListenersBound) {
    socket.on("connect_error", () => {
      // Real-time updates are optional; avoid noisy console errors when the
      // backend does not support the preferred transport.
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
