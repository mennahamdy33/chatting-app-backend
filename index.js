const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    "Access-Control-Allow-Origin": "https://localhost:3000",
  },
});

const port = process.env.PORT || 5000;
const users = [];
io.on("connection", (socket) => {
  socket.emit("users", users);
  console.log("a user connected", socket.id);
  users.push({id:socket.id,name:socket.handshake.query.name});
  socket.broadcast.emit("new-user", {id:socket.id,name:socket.handshake.query.name});
  socket.on("message", (message) => {
    console.log(message, socket.id);
    io.to(message.userId).emit("new-message", { message:message.message, id: socket.id });
    // socket.broadcast.emit("new-message", { message, id: socket.id });
  });
  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    const userIndex = users.indexOf(socket.id);
    users.splice(userIndex, 1);
    socket.broadcast.emit("delete-user", socket.id);
  });
});

server.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
