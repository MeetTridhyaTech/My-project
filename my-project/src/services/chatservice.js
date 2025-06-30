import * as signalR from "@microsoft/signalr";
import api from "../components/axiosInstance";

class ChatService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.CHAT_MENU_ID = "17DEC13F-8C9F-4287-A918-774375AC1B76";
    this.eventListeners = {};
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, ...args) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(...args));
    }
  }

  // Fetch users with their last messages
  async fetchUsersAndLastMessages(token, userId) {
    try {
      const res = await api.post(
        `user/search/${this.CHAT_MENU_ID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const filtered = res.data.data.filter(u => u.id !== userId);
      const times = {};
      const lastMsgs = {};
      
      for (const user of filtered) {
        try {
          const historyRes = await api.get(`chat/history/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (historyRes.data.length > 0) {
            const lastMsg = historyRes.data.reduce((latest, current) => 
              new Date(current.sentAt) > new Date(latest.sentAt) ? current : latest
            );
            times[user.id] = lastMsg.sentAt;
            lastMsgs[user.id] = lastMsg.message;
          }
        } catch (err) {
          console.error(`Error fetching history for user ${user.id}:`, err);
        }
      }
      
      return {
        users: filtered,
        lastMessageTimes: times,
        lastMessages: lastMsgs
      };
    } catch (err) {
      console.error("Failed to fetch users:", err);
      throw err;
    }
  }

  // Fetch chat history for a specific user
  async fetchChatHistory(receiverId, token) {
    try {
      const res = await api.get(`chat/history/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });chatService
      return res.data;
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      throw err;
    }
  }

  // Initialize SignalR connection
  async initializeConnection(token, userId) {
    try {
      if (this.connection) {
        await this.disconnect();
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7047/chathub?access_token=${token}&userId=${userId}`)
        // .withUrl(`http://172.16.3.84:8086/chathub?access_token=${token}&userId=${userId}`)
        .withAutomaticReconnect()
        .build();

      // Set up message handlers
      this.connection.on("ReceiveMessage", (message) => {
        this.emit("messageReceived", message);
      });

      this.connection.on("MessageSent", (message) => {
        this.emit("messageSent", message);
      });

      this.connection.on("UserTyping", (senderId)=>{
        this.emit("userTyping", senderId);
      });


      // Connection state handlers
      this.connection.onreconnecting(() => {
        this.isConnected = false;
        this.emit("connectionStateChanged", false);
      });

      this.connection.onreconnected(() => {
        this.isConnected = true;
        this.emit("connectionStateChanged", true);
      });

      this.connection.onclose(() => {
        this.isConnected = false;
        this.emit("connectionStateChanged", false);
      });

      await this.connection.start();
      this.isConnected = true;
      this.emit("connectionStateChanged", true);
      
      return true;
    } catch (err) {
      console.error("SignalR connection failed:", err);
      this.isConnected = false;
      this.emit("connectionStateChanged", false);
      throw err;
    }
  }

  // Send message through SignalR
  async sendMessage(receiverId, message) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error("Connection not established");
    }

    try {
      await this.connection.invoke("SendMessage", receiverId, message);
      return true;
    } catch (err) {
      console.error("Send error:", err);
      throw err;
    }
  }

  async sendTypingNotification(receiverId) {
  if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
    console.warn("Connection not established for typing notification");
    return;
  }

  try {
    await this.connection.invoke("SendTypingNotification", receiverId);
  } catch (err) {
    console.error("Failed to send typing notification:", err);
  }
}

  // Disconnect SignalR connection
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.error("SignalR stop error:", err);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.emit("connectionStateChanged", false);
      }
    }
  }

  // Get connection state
  getConnectionState() {
    return this.isConnected;
  }

  // Clean up all event listeners
  cleanup() {
    this.eventListeners = {};
    this.disconnect();
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;