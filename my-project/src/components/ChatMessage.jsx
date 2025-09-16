import { useEffect, useRef, useState, useMemo } from "react";
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Mic, Settings, LogOut, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import chatService from "../services/chatservice";
import EmojiPicker from 'emoji-picker-react';
import VideoCall from "./VideoCall";

const ChatMessage = () => {
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");


  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false); // hide after picking
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Notification setup
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    } else if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    notificationSoundRef.current = new Audio();
    notificationSoundRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMFl2+z9N6QQAYfXrTp66hVFApGn+DyvmwhBz2Zz+/Phy4IL3m69N+2UC8K";
    notificationSoundRef.current.volume = 0.3;

    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current = null;
      }
    };
  }, []);

  // Notification utilities
  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(console.error);
    }
  };

  const showNotification = (title, body) => {
    if (notificationPermission === "granted") {
      const notification = new Notification(title, { body });
      setTimeout(() => notification.close(), 4000);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const vibrate = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Fetch users and their last messages
  useEffect(() => {
    const fetchUsersAndLastMessages = async () => {
      try {
        const result = await chatService.fetchUsersAndLastMessages(token, userId);
        setUsers(result.users);
        setLastMessageTimes(result.lastMessageTimes);
        setLastMessages(result.lastMessages);
        // Simulate some users being online
        setOnlineUsers(new Set(result.users.slice(0, Math.floor(Math.random() * result.users.length)).map(u => u.id)));
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsersAndLastMessages();
  }, [token, userId]);

  // Set up chat service event listeners
  useEffect(() => {
    const handleMessageReceived = (message) => {
      if (message.senderId === receiver?.id || message.receiverId === receiver?.id) {
        setMessages(prev => [...prev, message]);

        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        setLastMessageTimes(prev => ({ ...prev, [otherUserId]: message.sentAt }));
        setLastMessages(prev => ({ ...prev, [otherUserId]: message.message }));

        if (message.senderId !== userId) {
          const sender = users.find(u => u.id === message.senderId);
          showNotification(
            sender ? `${sender.firstName} ${sender.lastName}` : "New message",
            message.message
          );
          playNotificationSound();
          vibrate();
        }
      }
    };

    // const handleMessageSent = (message) => {
    //   if (message.senderId === receiver?.id || message.receiverId === receiver?.id) {
    //     setMessages(prev => [...prev, message]);
    //     setLastMessageTimes(prev => ({ ...prev, [message.receiverId]: message.sentAt }));
    //     setLastMessages(prev => ({ ...prev, [message.receiverId]: message.message }));
    //     if ("vibrate" in navigator) navigator.vibrate(50);
    //   }
    // };

    const handleMessageSent = (message) => {
      if (message.senderId === receiver?.id || message.receiverId === receiver?.id) {
        setMessages(prev => [...prev, message]);
        setLastMessageTimes(prev => ({ ...prev, [message.receiverId]: message.sentAt }));
        setLastMessages(prev => ({ ...prev, [message.receiverId]: message.message }));

        // Play sound and vibrate when *you* send message
        playNotificationSound();
        vibrate();
      }
    };


    const handleConnectionStateChanged = (connected) => {
      setIsConnected(connected);
    };

    chatService.on("messageReceived", handleMessageReceived);
    chatService.on("messageSent", handleMessageSent);
    chatService.on("connectionStateChanged", handleConnectionStateChanged);

    const handleUserTyping = (senderId) => {
      if (receiver && senderId === receiver.id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
      }
    };
    chatService.on("userTyping", handleUserTyping);

    return () => {
      chatService.off("messageReceived", handleMessageReceived);
      chatService.off("messageSent", handleMessageSent);
      chatService.off("connectionStateChanged", handleConnectionStateChanged);
      chatService.off("userTyping", handleUserTyping); 
    };

  }, [receiver, userId, users, notificationPermission]);

  // Initialize connection and load chat history when receiver changes
  useEffect(() => {
    if (!receiver || !token || !userId) return;

    const initializeChat = async () => {
      try {
        await chatService.initializeConnection(token, userId);
        const history = await chatService.fetchChatHistory(receiver.id, token);
        setMessages(history);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    };

    initializeChat();

    return () => {
      if (!receiver) {
        chatService.disconnect();
      }
    };
  }, [receiver, token, userId]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      chatService.cleanup();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator simulation
  useEffect(() => {
    if (inputMessage.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [inputMessage]);

  // Sort users by last message time
  const sortedFilteredUsers = useMemo(() => {
    return [...users]
      .filter(user => `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const timeA = lastMessageTimes[a.id] || 0;
        const timeB = lastMessageTimes[b.id] || 0;

        if (timeA && timeB) return new Date(timeB) - new Date(timeA);
        if (timeA && !timeB) return -1;
        if (!timeA && timeB) return 1;
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });
  }, [users, searchTerm, lastMessageTimes]);

  const handleTyping = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (receiver && chatService.getConnectionState()) {
      try {
        chatService.connection.invoke("SendTypingNotification", receiver.id);
      } catch (err) {
        console.error("Typing notification error:", err);
      }
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !receiver) return;

    try {
      await chatService.sendMessage(receiver.id, inputMessage);
      setInputMessage("");
      if ("vibrate" in navigator) navigator.vibrate(30);
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    const utcDate = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(utcDate);
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.ceil((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return messageDate.toLocaleDateString([], { weekday: 'short' });
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const truncateLastMessage = (msg) => {
    if (!msg) return '';
    return msg.length > 35 ? `${msg.substring(0, 35)}...` : msg;
  };

  const handleLogout = () => {
    chatService.cleanup();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRandomGradient = (id) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-emerald-500 to-green-500',
      'from-amber-500 to-orange-500'
    ];
    return gradients[id?.length % gradients.length] || gradients[0];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-xl flex flex-col dark:bg-slate-900/80 dark:border-slate-700/50">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg font-bold">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Messages</h1>
                <p className="text-indigo-100 text-sm">{users.length} conversations</p>
              </div>
            </div>

            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={toggleSettingsMenu}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-slate-200 animate-in slide-in-from-top-2 dark:bg-slate-800 dark:border-slate-700">
                  <button
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 w-full text-left transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => console.log("Profile clicked")}
                  >
                    <User className="w-4 h-4 mr-3 text-indigo-500" />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 w-full text-left transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => console.log("Notifications clicked")}
                  >
                    <Bell className="w-4 h-4 mr-3 text-yellow-500" />
                    <span>Notifications</span>
                  </button>
                  <hr className="my-2 border-slate-200 dark:border-slate-700" />
                  <button
                    className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 placeholder-white/60 text-white outline-none focus:bg-white/30 focus:border-white/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedFilteredUsers.map((user, index) => (
            <div
              key={user.id}
              onClick={() => setReceiver(user)}
              className={`group flex items-center p-4 m-2 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-md animate-in slide-in-from-left ${receiver?.id === user.id
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border-l-4 border-indigo-500 dark:from-indigo-900/30 dark:to-purple-900/30"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative mr-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getRandomGradient(user.id)} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-slate-400'
                  }`}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap dark:text-slate-400">
                    {lastMessageTimes[user.id] ? formatLastSeen(lastMessageTimes[user.id]) : 'New'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500 truncate dark:text-slate-400">
                    {lastMessages[user.id] ? truncateLastMessage(lastMessages[user.id]) : "Start a conversation..."}
                  </div>
                  {lastMessages[user.id] && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full ml-2 flex-shrink-0"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {receiver ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/80 backdrop-blur-xl p-6 border-b border-slate-200/50 shadow-sm dark:bg-slate-900/80 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getRandomGradient(receiver.id)} rounded-full flex items-center justify-center text-white font-semibold shadow-lg`}>
                      {getInitials(receiver.firstName, receiver.lastName)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${onlineUsers.has(receiver.id) ? 'bg-green-500' : 'bg-slate-400'
                      }`}></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {receiver.firstName} {receiver.lastName}
                    </h2>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          {onlineUsers.has(receiver.id) ? 'Online' : 'Active now'}
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                            Connecting...
                          </div>

                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
                    <Video className="w-5 h-5" />
                  </button> */}

                            <button
            onClick={() => setShowVideoCall(true)} // ✅ Trigger video call
            className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowVideoCall(true)} // ✅ Trigger video call
            className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Video className="w-5 h-5" />
          </button>
                  <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-slate-800/30">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, index) => {
                  const isSender = msg.senderId?.toLowerCase() === userId?.toLowerCase();
                  return (
                    <div
                      key={msg.id || `${msg.senderId}-${msg.sentAt}`}
                      className={`flex animate-in slide-in-from-bottom-2 ${isSender ? "justify-end" : "justify-start"}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`group max-w-xs lg:max-w-md ${isSender ? "order-2" : "order-1"}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${isSender
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md"
                            : "bg-white text-slate-800 rounded-bl-md border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                            }`}
                        >
                          <div className="break-words leading-relaxed">{msg.message}</div>
                          <div className={`text-xs mt-2 flex items-center justify-end space-x-1 ${isSender ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                            }`}>
                            <span>{msg.sentAt ? formatTime(msg.sentAt) : "Sending..."}</span>
                            {isSender && <span className="text-indigo-200">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2">
                    <div className="bg-slate-200 text-slate-600 px-4 py-3 rounded-2xl rounded-bl-md dark:bg-slate-700 dark:text-slate-300">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                  
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white/80 backdrop-blur-xl p-6 border-t border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50">
              <div className="flex items-end space-x-4">
                <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={handleTyping} 
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 resize-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-700"
                    disabled={!receiver || !isConnected}
                    style={{ minHeight: '56px', maxHeight: '120px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Emoji Picker Component */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 right-0 z-50">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>

                {inputMessage.trim() ? (
                  <button
                    onClick={handleSend}
                    disabled={!receiver || !isConnected}
                    className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="p-4 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
                    <Mic className="w-5 h-5" />
                  </button>
                  
                )}
              </div>
            </div>
{showVideoCall && receiver && (
  <VideoCall
    hubConnection={chatService.connection}
    localUserId={userId}        
    remoteUserId={receiver.id}
  />
)}

          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-slate-800/30">
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-32 h-32 mx-auto mbf-8 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4 dark:text-slate-200">Welcome to Messages</h2>
              <p className="text-slate-600 text-lg mb-6 dark:text-slate-400">Select a conversation to start chatting</p>
              <div className="flex items-center justify-center space-x-2 text-indigo-600">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              {notificationPermission === "default" && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl inline-block dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-amber-700 text-sm flex items-center dark:text-amber-300">
                    <Bell className="w-4 h-4 mr-2" />
                    Enable notifications to never miss a message!
                  </p>
                  
                </div>
              )}
            </div>
            
          </div>

        )}
      </div>
    </div>
  );
};

export default ChatMessage;


// import { useEffect, useRef, useState, useMemo } from "react";
// import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Mic, Settings, LogOut, User, Bell, Check, CheckCheck, Image, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import chatService from "../services/chatservice";
// import EmojiPicker from 'emoji-picker-react';
// import VideoCall from "./VideoCall";

// const ChatMessage = () => {
//   const [users, setUsers] = useState([]);
//   const [receiver, setReceiver] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [showVideoCall, setShowVideoCall] = useState(false);
//   const [inputMessage, setInputMessage] = useState("");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [notificationPermission, setNotificationPermission] = useState("default");
//   const [lastMessageTimes, setLastMessageTimes] = useState({});
//   const [lastMessages, setLastMessages] = useState({});
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState(new Set());
//   const [selectedImage, setSelectedImage] = useState(null);
//   const typingTimeoutRef = useRef(null);

//   const messagesEndRef = useRef(null);
//   const notificationSoundRef = useRef(null);
//   const settingsMenuRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");

//   const handleEmojiClick = (emojiData) => {
//     setInputMessage((prev) => prev + emojiData.emoji);
//     setShowEmojiPicker(false);
//   };

//   // Close settings menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
//         setShowSettingsMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Notification setup
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission().then(permission => {
//         setNotificationPermission(permission);
//       });
//     } else if ("Notification" in window) {
//       setNotificationPermission(Notification.permission);
//     }

//     notificationSoundRef.current = new Audio();
//     notificationSoundRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBziR1/LNeSMFl2+z9N+QQAYfXrTp66hVFApGn+DyvmwhBz2Zz+/Phy4IL3m69N+2UC8K";
//     notificationSoundRef.current.volume = 0.3;

//     return () => {
//       if (notificationSoundRef.current) {
//         notificationSoundRef.current = null;
//       }
//     };
//   }, []);

//   // Notification utilities
//   const playNotificationSound = () => {
//     if (notificationSoundRef.current) {
//       notificationSoundRef.current.currentTime = 0;
//       notificationSoundRef.current.play().catch(console.error);
//     }
//   };

//   const showNotification = (title, body) => {
//     if (notificationPermission === "granted") {
//       const notification = new Notification(title, { body });
//       setTimeout(() => notification.close(), 4000);
//       notification.onclick = () => {
//         window.focus();
//         notification.close();
//       };
//     }
//   };

//   const vibrate = () => {
//     if ("vibrate" in navigator) {
//       navigator.vibrate([200, 100, 200]);
//     }
//   };

//   // Fetch users and their last messages
//   useEffect(() => {
//     const fetchUsersAndLastMessages = async () => {
//       try {
//         const result = await chatService.fetchUsersAndLastMessages(token, userId);
//         setUsers(result.users);
//         setLastMessageTimes(result.lastMessageTimes);
//         setLastMessages(result.lastMessages);
//         setOnlineUsers(new Set(result.users.slice(0, Math.floor(Math.random() * result.users.length)).map(u => u.id)));
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//       }
//     };

//     fetchUsersAndLastMessages();
//   }, [token, userId]);

//   // Set up chat service event listeners
//   useEffect(() => {
//     const handleMessageReceived = (message) => {
//       if (message.senderId === receiver?.id || message.receiverId === receiver?.id) {
//         setMessages(prev => [...prev, message]);

//         const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
//         setLastMessageTimes(prev => ({ ...prev, [otherUserId]: message.sentAt }));
//         setLastMessages(prev => ({ ...prev, [otherUserId]: message.message }));

//         if (message.senderId !== userId) {
//           const sender = users.find(u => u.id === message.senderId);
//           showNotification(
//             sender ? `${sender.firstName} ${sender.lastName}` : "New message",
//             message.message
//           );
//           playNotificationSound();
//           vibrate();
//         }
//       }
//     };

//     const handleMessageSent = (message) => {
//       if (message.senderId === receiver?.id || message.receiverId === receiver?.id) {
//         setMessages(prev => [...prev, message]);
//         setLastMessageTimes(prev => ({ ...prev, [message.receiverId]: message.sentAt }));
//         setLastMessages(prev => ({ ...prev, [message.receiverId]: message.message }));
//         playNotificationSound();
//         vibrate();
//       }
//     };

//     const handleConnectionStateChanged = (connected) => {
//       setIsConnected(connected);
//     };

//     chatService.on("messageReceived", handleMessageReceived);
//     chatService.on("messageSent", handleMessageSent);
//     chatService.on("connectionStateChanged", handleConnectionStateChanged);

//     const handleUserTyping = (senderId) => {
//       if (receiver && senderId === receiver.id) {
//         setIsTyping(true);
//         clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
//       }
//     };
//     chatService.on("userTyping", handleUserTyping);

//     return () => {
//       chatService.off("messageReceived", handleMessageReceived);
//       chatService.off("messageSent", handleMessageSent);
//       chatService.off("connectionStateChanged", handleConnectionStateChanged);
//       chatService.off("userTyping", handleUserTyping); 
//     };
//   }, [receiver, userId, users, notificationPermission]);

//   // Initialize connection and load chat history when receiver changes
//   useEffect(() => {
//     if (!receiver || !token || !userId) return;

//     const initializeChat = async () => {
//       try {
//         await chatService.initializeConnection(token, userId);
//         const history = await chatService.fetchChatHistory(receiver.id, token);
//         setMessages(history);
//       } catch (err) {
//         console.error("Failed to initialize chat:", err);
//       }
//     };

//     initializeChat();

//     return () => {
//       if (!receiver) {
//         chatService.disconnect();
//       }
//     };
//   }, [receiver, token, userId]);

//   // Cleanup on component unmount
//   useEffect(() => {
//     return () => {
//       chatService.cleanup();
//     };
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Sort users by last message time
//   const sortedFilteredUsers = useMemo(() => {
//     return [...users]
//       .filter(user => `${user.firstName} ${user.lastName}`
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()))
//       .sort((a, b) => {
//         const timeA = lastMessageTimes[a.id] || 0;
//         const timeB = lastMessageTimes[b.id] || 0;

//         if (timeA && timeB) return new Date(timeB) - new Date(timeA);
//         if (timeA && !timeB) return -1;
//         if (!timeA && timeB) return 1;
//         return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
//       });
//   }, [users, searchTerm, lastMessageTimes]);

//   const handleTyping = (e) => {
//     const value = e.target.value;
//     setInputMessage(value);

//     if (receiver && chatService.getConnectionState()) {
//       try {
//         chatService.connection.invoke("SendTypingNotification", receiver.id);
//       } catch (err) {
//         console.error("Typing notification error:", err);
//       }
//     }
//   };

//   const handleSend = async () => {
//     if (!inputMessage.trim() || !receiver) return;

//     try {
//       await chatService.sendMessage(receiver.id, inputMessage);
//       setInputMessage("");
//       if ("vibrate" in navigator) navigator.vibrate(30);
//     } catch (err) {
//       console.error("Send error:", err);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSelectedImage(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const formatTime = (date) => {
//     const utcDate = new Date(date);
//     return new Intl.DateTimeFormat('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//       timeZone: 'Asia/Kolkata'
//     }).format(utcDate);
//   };

//   const formatLastSeen = (date) => {
//     const now = new Date();
//     const messageDate = new Date(date);
//     const diffDays = Math.ceil((now - messageDate) / (1000 * 60 * 60 * 24));

//     if (diffDays === 1) return 'Today';
//     if (diffDays === 2) return 'Yesterday';
//     if (diffDays <= 7) return messageDate.toLocaleDateString([], { weekday: 'short' });
//     return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
//   };

//   const truncateLastMessage = (msg) => {
//     if (!msg) return '';
//     return msg.length > 35 ? `${msg.substring(0, 35)}...` : msg;
//   };

//   const handleLogout = () => {
//     chatService.cleanup();
//     localStorage.removeItem("token");
//     localStorage.removeItem("userId");
//     navigate("/login");
//   };

//   const toggleSettingsMenu = () => {
//     setShowSettingsMenu(!showSettingsMenu);
//   };

//   const getInitials = (firstName, lastName) => {
//     return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
//   };

//   const getRandomGradient = (id) => {
//     const gradients = [
//       'from-violet-500 via-purple-500 to-indigo-500',
//       'from-cyan-400 via-blue-500 to-indigo-600',
//       'from-emerald-400 via-teal-500 to-cyan-600',
//       'from-rose-400 via-pink-500 to-purple-600',
//       'from-amber-400 via-orange-500 to-red-500',
//       'from-lime-400 via-green-500 to-emerald-600',
//       'from-blue-400 via-indigo-500 to-purple-600',
//       'from-pink-400 via-rose-500 to-red-500'
//     ];
//     return gradients[id?.length % gradients.length] || gradients[0];
//   };

//   const MessageStatus = ({ status, isSender }) => {
//     if (!isSender) return null;
    
//     return (
//       <div className="flex items-center ml-1">
//         {status === 'sending' && (
//           <div className="w-3 h-3 border border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
//         )}
//         {status === 'sent' && (
//           <Check className="w-3 h-3 text-blue-200" />
//         )}
//         {status === 'delivered' && (
//           <CheckCheck className="w-3 h-3 text-blue-200" />
//         )}
//         {status === 'read' && (
//           <CheckCheck className="w-3 h-3 text-blue-300" />
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Sidebar */}
//       <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col">
//         {/* Header */}
//         <div className="p-6 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 border-b border-white/10">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
//                 <span className="text-xl font-bold text-white">💬</span>
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white">Messages</h1>
//                 <p className="text-purple-200 text-sm">{users.length} conversations</p>
//               </div>
//             </div>

//             <div className="relative" ref={settingsMenuRef}>
//               <button
//                 onClick={toggleSettingsMenu}
//                 className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
//               >
//                 <Settings className="w-5 h-5 text-white" />
//               </button>

//               {showSettingsMenu && (
//                 <div className="absolute right-0 top-12 w-56 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-in slide-in-from-top-2">
//                   <button
//                     className="flex items-center px-4 py-3 text-sm text-white hover:bg-white/10 w-full text-left transition-colors rounded-xl mx-2"
//                     onClick={() => console.log("Profile clicked")}
//                   >
//                     <User className="w-4 h-4 mr-3 text-violet-400" />
//                     <span>Profile Settings</span>
//                   </button>
//                   <button
//                     className="flex items-center px-4 py-3 text-sm text-white hover:bg-white/10 w-full text-left transition-colors rounded-xl mx-2"
//                     onClick={() => console.log("Notifications clicked")}
//                   >
//                     <Bell className="w-4 h-4 mr-3 text-yellow-400" />
//                     <span>Notifications</span>
//                   </button>
//                   <hr className="my-2 border-white/20 mx-4" />
//                   <button
//                     className="flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 w-full text-left transition-colors rounded-xl mx-2"
//                     onClick={handleLogout}
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     <span>Sign Out</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
//             <input
//               type="text"
//               placeholder="Search conversations..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 placeholder-white/40 text-white outline-none focus:bg-white/20 focus:border-violet-400/50 transition-all duration-300"
//             />
//           </div>
//         </div>

//         {/* User List */}
//         <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
//           {sortedFilteredUsers.map((user, index) => (
//             <div
//               key={user.id}
//               onClick={() => setReceiver(user)}
//               className={`group flex items-center p-4 m-2 cursor-pointer rounded-2xl transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] transform ${receiver?.id === user.id
//                 ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 shadow-xl border border-violet-400/30 scale-[1.02]"
//                 : ""
//                 }`}
//               style={{ animationDelay: `${index * 50}ms` }}
//             >
//               <div className="relative mr-4">
//                 <div className={`w-14 h-14 bg-gradient-to-br ${getRandomGradient(user.id)} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl ring-2 ring-white/20`}>
//                   {getInitials(user.firstName, user.lastName)}
//                 </div>
//                 <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black shadow-lg ${onlineUsers.has(user.id) ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
//               </div>

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center justify-between mb-1">
//                   <h3 className="font-bold text-white truncate group-hover:text-violet-300 transition-colors text-lg">
//                     {user.firstName} {user.lastName}
//                   </h3>
//                   <span className="text-xs text-white/50 whitespace-nowrap">
//                     {lastMessageTimes[user.id] ? formatLastSeen(lastMessageTimes[user.id]) : 'New'}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-white/60 truncate">
//                     {lastMessages[user.id] ? truncateLastMessage(lastMessages[user.id]) : "Start a conversation..."}
//                   </div>
//                   {lastMessages[user.id] && (
//                     <div className="w-2 h-2 bg-violet-400 rounded-full ml-2 flex-shrink-0 animate-pulse"></div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {receiver ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-black/20 backdrop-blur-xl p-6 border-b border-white/10 shadow-lg">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="relative">
//                     <div className={`w-14 h-14 bg-gradient-to-br ${getRandomGradient(receiver.id)} rounded-2xl flex items-center justify-center text-white font-bold shadow-xl ring-2 ring-white/20`}>
//                       {getInitials(receiver.firstName, receiver.lastName)}
//                     </div>
//                     <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black shadow-lg ${onlineUsers.has(receiver.id) ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-white">
//                       {receiver.firstName} {receiver.lastName}
//                     </h2>
//                     <div className="text-sm text-white/60 flex items-center">
//                       {isConnected ? (
//                         <>
//                           <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
//                           {onlineUsers.has(receiver.id) ? 'Online' : 'Active now'}
//                         </>
//                       ) : (
//                         <>
//                           <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
//                           Connecting...
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => setShowVideoCall(true)}
//                     className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
//                   >
//                     <Phone className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => setShowVideoCall(true)}
//                     className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
//                   >
//                     <Video className="w-5 h-5" />
//                   </button>
//                   <button className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20">
//                     <MoreVertical className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Messages Area */}
//             <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-900/50 to-purple-900/20 custom-scrollbar">
//               <div className="max-w-4xl mx-auto space-y-6">
//                 {messages.map((msg, index) => {
//                   const isSender = msg.senderId?.toLowerCase() === userId?.toLowerCase();
//                   return (
//                     <div
//                       key={msg.id || `${msg.senderId}-${msg.sentAt}`}
//                       className={`flex animate-in slide-in-from-bottom-2 hover:scale-[1.01] transition-transform duration-200 ${isSender ? "justify-end" : "justify-start"}`}
//                       style={{ animationDelay: `${index * 50}ms` }}
//                     >
//                       <div className={`group flex max-w-lg ${isSender ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
//                         {/* Avatar for received messages */}
//                         {!isSender && (
//                           <div className={`w-8 h-8 bg-gradient-to-br ${getRandomGradient(msg.senderId)} rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg mb-1 flex-shrink-0`}>
//                             {receiver ? getInitials(receiver.firstName, receiver.lastName) : '?'}
//                           </div>
//                         )}

//                         <div className={`relative ${isSender ? 'mr-2' : 'ml-2'}`}>
//                           {/* Message Bubble */}
//                           <div
//                             className={`px-6 py-4 rounded-3xl shadow-xl backdrop-blur-sm border transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] ${
//                               isSender
//                                 ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-lg border-violet-400/30 shadow-violet-500/25"
//                                 : "bg-white/10 text-white rounded-bl-lg border-white/20 shadow-black/20"
//                             }`}
//                           >
//                             {/* Message Content */}
//                             <div className="break-words leading-relaxed text-sm">
//                               {msg.message}
//                             </div>

//                             {/* Timestamp and Status */}
//                             <div className={`flex items-center justify-end mt-2 space-x-1 text-xs ${
//                               isSender ? "text-violet-200" : "text-white/50"
//                             }`}>
//                               <span>{msg.sentAt ? formatTime(msg.sentAt) : "Sending..."}</span>
//                               <MessageStatus status={msg.status || 'delivered'} isSender={isSender} />
//                             </div>
//                           </div>

//                           {/* Message tail */}
//                           <div className={`absolute bottom-0 w-4 h-4 ${
//                             isSender 
//                               ? "right-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-bl-full"
//                               : "left-0 bg-white/10 rounded-br-full"
//                           }`}></div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//                 {/* Typing Indicator */}
//                 {isTyping && (
//                   <div className="flex justify-start animate-in slide-in-from-bottom-2">
//                     <div className="flex items-end space-x-2">
//                       <div className={`w-8 h-8 bg-gradient-to-br ${getRandomGradient(receiver.id)} rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg flex-shrink-0`}>
//                         {getInitials(receiver.firstName, receiver.lastName)}
//                       </div>
//                       <div className="bg-white/10 text-white px-6 py-4 rounded-3xl rounded-bl-lg border border-white/20 backdrop-blur-sm">
//                         <div className="flex space-x-1">
//                           <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
//                           <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                           <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* Message Input */}
//             <div className="bg-black/20 backdrop-blur-xl p-6 border-t border-white/10">
//               {selectedImage && (
//                 <div className="mb-4 relative inline-block">
//                   <img src={selectedImage} alt="Selected" className="w-32 h-32 object-cover rounded-2xl border border-white/20" />
//                   <button
//                     onClick={() => setSelectedImage(null)}
//                     className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </div>
//               )}
              
//               <div className="flex items-end space-x-4">
//                 <button 
//                   onClick={() => fileInputRef.current?.click()}
//                   className="p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/30 hover:scale-110"
//                 >
//                   <Paperclip className="w-5 h-5" />
//                 </button>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageSelect}
//                   className="hidden"
//                 />
                
//                 <div className="flex-1 relative">
//                   <textarea
//                     value={inputMessage}
//                     onChange={handleTyping} 
//                     onKeyPress={handleKeyPress}
//                     placeholder="Type your message..."
//                     rows={1}
//                     className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 outline-none focus:bg-white/20 focus:border-violet-400/50 resize-none transition-all duration-300 text-white placeholder-white/40"
//                     disabled={!receiver || !isConnected}
//                     style={{ minHeight: '56px', maxHeight: '120px' }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowEmojiPicker(prev => !prev)}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors hover:scale-110 duration-300"
//                   >
//                     <Smile className="w-5 h-5" />
//                   </button>

//                   {/* Emoji Picker Component */}
//                   {showEmojiPicker && (
//                     <div className="absolute bottom-16 right-0 z-50">
//                       <EmojiPicker onEmojiClick={handleEmojiClick} />
//                     </div>
//                   )}
//                 </div>

//                 {inputMessage.trim() ? (
//                   <button
//                     onClick={handleSend}
//                     disabled={!receiver || !isConnected}
//                     className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-slate-500 disabled:to-slate-600 text-white rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-violet-500/50 transform hover:scale-110 disabled:transform-none border border-violet-400/30"
//                   >
//                     <Send className="w-5 h-5" />
//                   </button>
//                 ) : (
//                   <button className="p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/30 hover:scale-110">
//                     <Mic className="w-5 h-5" />
//                   </button>
//                 )}
//               </div>
//             </div>

//             {showVideoCall && receiver && (
//               <VideoCall
//                 hubConnection={chatService.connection}
//                 localUserId={userId}        
//                 remoteUserId={receiver.id}
//               />
//             )}

//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-purple-900/20">
//             <div className="text-center animate-in fade-in duration-500">
//               <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse ring-4 ring-white/20">
//                 <span className="text-5xl">💬</span>
//               </div>
//               <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
//                 Welcome to Messages
//               </h2>
//               <p className="text-white/60 text-xl mb-8">Select a conversation to start chatting</p>
//               <div className="flex items-center justify-center space-x-3">
//                 <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
//                 <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                 <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//               </div>
//               {notificationPermission === "default" && (
//                 <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl inline-block">
//                   <p className="text-white/80 text-sm flex items-center">
//                     <Bell className="w-4 h-4 mr-2 text-yellow-400" />
//                     Enable notifications to never miss a message!
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(139, 92, 246, 0.5);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(139, 92, 246, 0.7);
//         }
        
//         @keyframes animate-in {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-in {
//           animation: animate-in 0.3s ease-out;
//         }
        
//         .slide-in-from-bottom-2 {
//           animation: slideInFromBottom 0.3s ease-out;
//         }
        
//         .slide-in-from-top-2 {
//           animation: slideInFromTop 0.3s ease-out;
//         }
        
//         .slide-in-from-left {
//           animation: slideInFromLeft 0.3s ease-out;
//         }
        
//         .fade-in {
//           animation: fadeIn 0.5s ease-out;
//         }
        
//         @keyframes slideInFromBottom {
//           from {
//             opacity: 0;
//             transform: translateY(8px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes slideInFromTop {
//           from {
//             opacity: 0;
//             transform: translateY(-8px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes slideInFromLeft {
//           from {
//             opacity: 0;
//             transform: translateX(-8px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }
        
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ChatMessage;