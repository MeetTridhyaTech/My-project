// src/services/chatService.js

import * as signalR from "@microsoft/signalr";

let connection = null;

export const connectToChatHub = async (userId, onMessageReceived) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:5000/chathub?userId=${userId}`)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ReceiveMessage", (message) => {
    if (onMessageReceived) onMessageReceived(message);
  });

  connection.on("MessageSent", (message) => {
    console.log("Message sent confirmation:", message);
  });

  connection.on("Error", (error) => {
    alert("Error from server: " + error);
  });

  try {
    await connection.start();
    console.log("Connected to chat hub");
  } catch (err) {
    console.error("SignalR Connection Error:", err);
  }
};

export const sendMessage = async (senderId, receiverId, message) => {
  if (!connection) return;

  try {
    await connection.invoke("SendMessage", senderId, receiverId, message);
  } catch (err) {
    console.error("Error sending message:", err);
  }
};
