const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express();

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true,
});

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.set("port", PORT);
app.listen(app.get("port"), () => {
  console.log(`listening at localhost:${PORT}...`);
});

const chatHistory = { messages: [] };

app.get("/", function (req, res) {
  //   console.log(req);
  res.send("<pre>" + JSON.stringify(chatHistory, null, 2) + "</pre>");
});

// app.get("*", (req, res) => {
//   return handler(req, res);
// });

app.post("/message", (req, res, next) => {
  const { user = null, message = "", timestamp = +new Date() } = req.body;
  // const sentimentScore = sentiment.analyze(message).score;
  const chat = { user, message, timestamp };

  chatHistory.messages.push(chat);
  pusher.trigger("chat-room", "new-message", { chat });
});

app.post("/messages", (req, res, next) => {
  res.json({ ...chatHistory, status: "success" });
});

app.listen();
