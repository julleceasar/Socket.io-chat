import { createServer } from "http";
import { Server } from "socket.io";
import express from 'express'

const app = express()
const httpServer = createServer(app); 
const port = 3000;
const io = new Server(httpServer)

app.use("/", express.static("./client"))

io.on("connection", (socket) => {
    console.log(`Socket witd ID: ${socket.id} has connected!`);
})


httpServer.listen(port, () =>{
    console.log(`server is running on: ${port}`);
})