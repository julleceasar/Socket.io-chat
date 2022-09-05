import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import fetch from "node-fetch";

const app = express();
const httpServer = createServer(app);
const port = 3000;
const io = new Server(httpServer);
const GIPHY_KEY = 'upq9NMruqNpiC0ZIYBAXu4bp2X5w0RDP'


app.use("/", express.static("./client"));
app.use(express.json());

const users = []; // Users array

app.get("/test/", async (req, res) => {
    const response = await fetch(
        `http://api.giphy.com/v1/gifs/search?q=hot&api_key=${GIPHY_KEY}&limit=10`
      );
      const data = await response.json();
      res.json(data);
      /* res.send(response); */
});

io.on("connection", (socket) => {
  console.log(`Socket witd ID: ${socket.id} has connected!`);

  socket.on("new-user", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
  });

  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", { message: data, name: users[socket.id] });
  });


  socket.on("login", ({ name, room }, callback) => {
    //socket.leave & socket.join
    users.push({ username: socket.name, id: socket.id });
    console.log(users);

    io.emit("update-users", users, users.length);
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
  socket.on("user-disconnect", (name) => {
    socket.broadcast.emit("user-disconnected", name);
    users.splice(users.indexOf(name), 1); //Remove from users array
    io.emit("update-users", users, users.length);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on: ${port}`);
});
