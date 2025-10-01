// backend/server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const boardRoutes = require("./routes/boards");
const listRoutes = require("./routes/lists");
const cardRoutes = require("./routes/cards");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);

// Create http server + socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// attach io so route handlers can emit
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
