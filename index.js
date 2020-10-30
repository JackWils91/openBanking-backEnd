/**
 * @file The application root. Defines the Express server configuration.
 */
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const { errorHandler } = require("./middleware");

const {
  usersRouter,
  itemsRouter,
  accountsRouter,
  institutionsRouter,
  serviceRouter,
  linkEventsRouter,
  linkTokensRouter,
  unhandledRouter,
} = require("./routes");

const app = express();

const { PORT = 5000 } = process.env;
// const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
const io = socketIo(server);

//const corsOptions = { origin: "https://open-banking-mauve.vercel.app" };
const corsOptions = { origin: "http://localhost:3000" };
app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// middleware to pass socket to each request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Set socket.io listeners.
io.on("connection", (socket) => {
  console.log("SOCKET CONNECTED");

  socket.on("disconnect", () => {
    console.log("SOCKET DISCONNECTED");
  });
});

app.get("/test", (req, res) => {
  res.send("test response");
});

app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/accounts", accountsRouter);
app.use("/institutions", institutionsRouter);
app.use("/services", serviceRouter);
app.use("/link-event", linkEventsRouter);
app.use("/link-token", linkTokensRouter);
app.use("*", unhandledRouter);

// Error handling has to sit at the bottom of the stack.
// https://github.com/expressjs/express/issues/2718
app.use(errorHandler);
