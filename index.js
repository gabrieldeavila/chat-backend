// index.js

const path = require("path");

const httpServer = require("http").createServer();
const express = require("express");

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://chat-brown.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const formatMessage = require("./helpers/formatDate");
const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers,
} = require("./helpers/userHelper");

const app = express();

// Pasta pública
app.use(express.static(path.join(__dirname, "public")));

// roda quando o usuário acessa a rota
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    // Mensagem de boas vindas
    socket.emit(
      "message",
      formatMessage("Pato Chato", `Bem vindo ao chat, ${user.username}!`, "6")
    );

    // Broadcast toda vez que um novo usuário entrar
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Pato Chato", `${user.username} entrou na sala!`, "6")
      );

    // Nome dos usuários na sala
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getIndividualRoomUsers(user.room),
    });
  });

  // Checa por mensagens do usuário
  socket.on("chatMessage", (msg) => {
    const user = getActiveUser(socket.id);

    if (user) {
      io.to(user?.room).emit(
        "message",
        formatMessage(user.username, msg, user.image)
      );
    }
  });

  // Quando usuário se desconecta
  socket.on("disconnect", () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Pato Chato", `${user.username} saiu da sala :< `, "6")
      );

      // Nomes dos usuários da sala e sala atual
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getIndividualRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
