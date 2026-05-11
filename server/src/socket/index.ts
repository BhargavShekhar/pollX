import type { Server as httpServer } from "node:http";
import { Server } from "socket.io";

function initializeSocket(server: httpServer) {
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("new socket connected", socket.id);
    })

    return io;
}

export default initializeSocket;