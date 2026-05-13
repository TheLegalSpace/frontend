import { io, Socket } from "socket.io-client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://legalspace.onrender.com";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(BASE_URL, {
    path: "/realtime",
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => console.log("Socket connected"));
  socket.on("disconnect", (reason: string) => console.log("Socket dropped:", reason));
  socket.on("connect_error", (err: Error) =>
    console.error("Socket error:", err.message)
  );

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}