import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_SOCKET_URL || "http://localhost:8080";

export const socket = io(BACKEND_URL, {
    autoConnect: false
})

socket.on("connect_error", (err) => {
    console.log("socket connect error:", err.message)
})

socket.on("connect", () => {
    console.log("socket connected:", socket.id)
})