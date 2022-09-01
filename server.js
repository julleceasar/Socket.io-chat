import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const httpServer = createServer(app);
const port = 3000;
const io = new Server(httpServer);

app.use("/", express.static("./client"));
app.use(express.json())


let users = [
    {
        name: "julle",
        age: 22
    },
    {
        name: "Snabeln",
        age: 26
    }
]; // Users array

app.get('/test', (req, res) => {
    res.send(users)
})

io.on("connection", (socket) => {
  console.log(`Socket witd ID: ${socket.id} has connected!`);

  socket.on("message", (data) => {
    console.log(data)
    io.emit("message", data)
})

  socket.on("login", ({ name, room }, callback) => {
    //socket.leave & socket.join
    users.push({ username: socket.name, id: socket.id });
    console.log(users);

    io.emit("update users", users, users.length);
    socket.broadcast.emit("user joined", socket.name);
  });
  socket.on("sendMessage", (message) => {
    let msgObject = {
      message: msg,
      user: socket.name,
      private: false,
    };
    if (room === "") {
      socket.broadcast.emit("chat message", msgObject);
    } else {
      msgObject.private = true;
      socket.to(room).emit("chat message", msgObject);
    }
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.name);
    users.splice(users.indexOf(socket.name), 1); //Remove from users array
    io.emit("update users", users, users.length);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on: ${port}`);
});
