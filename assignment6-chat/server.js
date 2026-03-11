import "dotenv/config";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import OpenAI from "openai";

const app = express();
const server = http.createServer(app);

// Socket.IO server (WebSockets)
const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

// client files from /public (index.html, client.js, style.css, etc.)
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// reads key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//
function shouldBotRespond(message) {
  return typeof message === "string" && message.toLowerCase().includes("@bot");
}

function stripBotKeyword(message) {
  return message.replace(/@bot/gi, "").trim();
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // a nice to have: let u know someone joined
  socket.broadcast.emit("system_message", {
    user: "system",
    text: "A user joined the chat.",
    time: new Date().toISOString(),
  });

  // Expect messages from client as: { user: "Name", text: "Hello" }
  socket.on("chat_message", async (payload) => {
    try {
      const user = payload?.user?.trim() || "Anonymous";
      const text = payload?.text ?? "";

      // 1) Broadcast the user's message
      io.emit("chat_message", {
        user,
        text,
        time: new Date().toISOString(),
      });

      // 2) If message includes @bot, generate AI response
      if (!shouldBotRespond(text)) return;

      // show "bot is typing" 
      io.emit("bot_typing", { isTyping: true });

      const prompt = stripBotKeyword(text);

      // typed only "@bot"
      if (!prompt) {
        io.emit("chat_message", {
          user: "ChatBot",
          text: "Type `@bot` followed by your question 🙂",
          time: new Date().toISOString(),
        });
        io.emit("bot_typing", { isTyping: false });
        return;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful chatbot in a class WebSocket chat app. Keep answers concise and friendly.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      });

      const botText =
        completion?.choices?.[0]?.message?.content?.trim() ||
        "Sorry — I didn’t get a response.";

      // 3) Broadcast the bot message to everyone
      io.emit("chat_message", {
        user: "ChatBot",
        text: botText,
        time: new Date().toISOString(),
        isBot: true, // client can use this to style it differently
      });

      io.emit("bot_typing", { isTyping: false });
    } catch (err) {
      console.error("Error handling chat_message:", err);

      // here ill make sure typing indicator turns off if something fails
      io.emit("bot_typing", { isTyping: false });

      io.emit("chat_message", {
        user: "ChatBot",
        text: "Sorry — I ran into an error talking to the AI API.",
        time: new Date().toISOString(),
        isBot: true,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.broadcast.emit("system_message", {
      user: "system",
      text: "A user left the chat.",
      time: new Date().toISOString(),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});