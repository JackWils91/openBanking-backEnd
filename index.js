const bodyParser = require("body-parser");
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
const PORT = process.env.PORT || 5000;

app.set("port", PORT);
app.listen(app.get("port"), () => {
  console.log(`listening at localhost:${PORT}...`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const chatHistory = { messages: [] };

app.get("/", function (req, res) {
  //   console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

// app.get("*", (req, res) => {
//   return handler(req, res);
// });

app.post("/message", (req, res, next) => {
  const { user = null, message = "", timestamp = +new Date() } = req.body;
  const sentimentScore = sentiment.analyze(message).score;
  const chat = { user, message, timestamp, sentiment: sentimentScore };

  chatHistory.messages.push(chat);
  pusher.trigger("chat-room", "new-message", { chat });
});

app.post("/messages", (req, res, next) => {
  res.json({ ...chatHistory, status: "success" });
});

app.listen();
