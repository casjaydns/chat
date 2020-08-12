const http = require("http");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const socketio = require("socket.io");
const cors = require("cors");
const router = require("./router");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());
router.use(morgan("combined"));
app.disable("x-powered-by");

io.on("connect", (socket) => {
  socket.on("join", ({
    name,
    room
  }, callback) => {
    const {
      error,
      user
    } = addUser({
      id: socket.id,
      name,
      room,
    });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined!`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", {
      user: user.name,
      text: message,
    });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`chat has started on port ${port}.`));
