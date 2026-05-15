import type { Server as httpServer } from "node:http";
import { Server } from "socket.io";

let io: Server;

export function initializeSocket(server: httpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL!,
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("new socket connected", socket.id);

        socket.on("join:poll", (pollId: string) => {
            socket.join(pollId);
            console.log(`socket ${socket.id} joined poll ${pollId}`);
        });

        socket.on("leave:poll", (pollId: string) => {
            socket.leave(pollId);
        });

        socket.on("disconnect", () => {
            console.log("socket disconnected", socket.id);
        });
    })

    return io;
}

export { io };