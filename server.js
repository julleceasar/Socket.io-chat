import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const GIPHY_KEY = "upq9NMruqNpiC0ZIYBAXu4bp2X5w0RDP";
const httpServer = createServer(app);
const port = 3000;
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use("/", express.static("./client"));
app.use(express.json());

const users = []; // Users array

app.get("/gifs/:data", async (req, res) => {
  let url =
    req.params.data == "Trending"
      ? `http://api.giphy.com/v1/stickers/trending?api_key=${GIPHY_KEY}&limit=15`
      : `http://api.giphy.com/v1/stickers/search?q=${req.params.data}&api_key=${GIPHY_KEY}&limit=15`;

  console.log(url);

  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
  /* res.send(response); */
});

app.get("/jokes", async (req, res) => {
  const response = await fetch(
    "https://v2.jokeapi.dev/joke/Programming,Miscellaneous?blacklistFlags=religious,political,explicit&type=single&amount=10"
  );
  const data = await response.json();
  res.json(data);
  /* res.send(response); */
});

io.on("connection", (socket) => {
  console.log(`Socket witd ID: ${socket.id} has connected!`);

  socket.on("new-user", (name) => {
    socket.nickname = name;
    socket.broadcast.emit("user-connected", name);
  });

  socket.on("message", (data, img) => {
    console.log(data);
    io.emit("message", { message: data, img, name: socket.nickname });
  });

  socket.on("disconnect", (name) => {
    io.emit("message", { message: socket.nickname + ' has left!', name: "" });
   /*  socket.broadcast.emit('user-disconnected', {name: socket.nickname}) */

    users.splice(users.indexOf(name), 1); //Remove from users array
    io.emit("update-users", users, users.length);
    //adapt
  });

  socket.on("typing", (data, name) => {
    socket.broadcast.emit("typing", data, name);
  });

  /*   socket.on('gifs', async (data) => {
    await fetch(`http://api.giphy.com/v1/gifs/search?q=${req.params.name}&api_key=${GIPHY_KEY}&limit=5`)
  }); */
});

httpServer.listen(port, () => {
  console.log(`Server is running on: ${port}`);
});
