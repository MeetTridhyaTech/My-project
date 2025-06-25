
// import { useEffect, useRef, useState, useMemo } from "react";
// import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Mic, Settings, LogOut, User, Bell } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import chatService from "../services/chatservice";

// const ChatMessage = () => {
//   const [users, setUsers] = useState([]);
//   const [receiver, setReceiver] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isConnected, setIsConnected] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [notificationPermission, setNotificationPermission] = useState("default");
//   const [lastMessageTimes, setLastMessageTimes] = useState({});
//   const [lastMessages, setLastMessages] = useState({});
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);

//   const messagesEndRef = useRef(null);
//   const notificationSoundRef = useRef(null);
//   const settingsMenuRef = useRef(null);
//   const navigate = useNavigate();

//   const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");

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
//     notificationSoundRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMFl2+z9N6QQAYfXrTp66hVFApGn+DyvmwhBz2Zz+/Phy4IL3m69N+2UC8K";
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
//     if (notificationPermission === "granted" && document.hidden) {
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
//         if ("vibrate" in navigator) navigator.vibrate(50);
//       }
//     };

//     const handleConnectionStateChanged = (connected) => {
//       setIsConnected(connected);
//     };

//     chatService.on("messageReceived", handleMessageReceived);
//     chatService.on("messageSent", handleMessageSent);
//     chatService.on("connectionStateChanged", handleConnectionStateChanged);

//     return () => {
//       chatService.off("messageReceived", handleMessageReceived);
//       chatService.off("messageSent", handleMessageSent);
//       chatService.off("connectionStateChanged", handleConnectionStateChanged);
//     };
//   }, [receiver, userId, users, notificationPermission]);

//   // Initialize connection and load chat history when receiver changes
//   useEffect(() => {
//     if (!receiver || !token || !userId) return;

//     const initializeChat = async () => {
//       try {
//         // Initialize SignalR connection
//         await chatService.initializeConnection(token, userId);
        
//         // Load chat history
//         const history = await chatService.fetchChatHistory(receiver.id, token);
//         setMessages(history);
//       } catch (err) {
//         console.error("Failed to initialize chat:", err);
//       }
//     };

//     initializeChat();

//     return () => {
//       // Clean up when receiver changes or component unmounts
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
//     return msg.length > 30 ? `${msg.substring(0, 30)}...` : msg;
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

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Chat List Panel */}
//       <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
//         <div className="bg-gray-50 p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
//             <div className="relative" ref={settingsMenuRef}>
//               <button 
//                 onClick={toggleSettingsMenu}
//                 className="text-gray-600 hover:text-green-600 transition-colors"
//               >
//                 <Settings className="w-5 h-5" />
//               </button>
              
//               {/* Settings Dropdown Menu */}
//               {showSettingsMenu && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
//                   <button 
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                     onClick={() => console.log("Profile clicked")}
//                   >
//                     <User className="w-4 h-4 mr-2" />
//                     Profile
//                   </button>
//                   <button 
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                     onClick={() => console.log("Notifications clicked")}
//                   >
//                     <Bell className="w-4 h-4 mr-2" />
//                     Notifications
//                   </button>
//                   <button 
//                     className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
//                     onClick={handleLogout}
//                   >
//                     <LogOut className="w-4 h-4 mr-2" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search conversations"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none outline-none focus:bg-white focus:ring-2 focus:ring-green-500"
//             />
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           {sortedFilteredUsers.map((user) => (
//             <div
//               key={user.id}
//               onClick={() => setReceiver(user)}
//               className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
//                 receiver?.id === user.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
//               }`}
//             >
//               <div className="relative mr-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
//                   {user.firstName[0]}{user.lastName[0]}
//                 </div>
//                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//               </div>

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-semibold text-gray-900 truncate">
//                     {user.firstName} {user.lastName}
//                   </h3>
//                   <span className="text-xs text-gray-500 whitespace-nowrap">
//                     {lastMessageTimes[user.id] ? formatLastSeen(lastMessageTimes[user.id]) : formatLastSeen(user.lastSeen || new Date())}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <p className="text-sm text-gray-500 truncate">
//                     {lastMessages[user.id] ? truncateLastMessage(lastMessages[user.id]) : "No messages yet"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Chat Window */}
//       <div className="flex-1 flex flex-col">
//         {receiver ? (
//           <>
//             <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
//               <div className="flex items-center">
//                 <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
//                   {receiver.firstName[0]}{receiver.lastName[0]}
//                 </div>
//                 <div>
//                   <h2 className="font-semibold text-gray-900">
//                     {receiver.firstName} {receiver.lastName}
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     {isConnected ? "Online" : "Connecting..."}
//                   </p>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-4">
//                 <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
//                 <Video className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
//                 <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50 bg-opacity-30" style={{
//               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//             }}>
//               <div className="max-w-4xl mx-auto">
//                 {messages.map((msg) => {
//                   const isSender = msg.senderId?.toLowerCase() === userId?.toLowerCase();
//                   return (
//                     <div
//                       key={msg.id || `${msg.senderId}-${msg.sentAt}`}
//                       className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
//                     >
//                       <div
//                         className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
//                           isSender
//                             ? "bg-green-500 text-white rounded-br-sm"
//                             : "bg-white text-gray-800 rounded-bl-sm"
//                         }`}
//                       >
//                         <div className="break-words">{msg.message}</div>
//                         <div className={`text-xs mt-1 ${isSender ? "text-green-100" : "text-gray-500"} text-right`}>
//                           {msg.sentAt ? formatTime(msg.sentAt) : "Sending..."}
//                           <span className="ml-1">✓✓</span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             <div className="bg-gray-50 p-4 border-t border-gray-200">
//               <div className="flex items-end space-x-2">
//                 <button className="p-2 text-gray-600 hover:text-green-600">
//                   <Paperclip className="w-5 h-5" />
//                 </button>
                
//                 <div className="flex-1 relative">
//                   <input
//                     type="text"
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Type a message..."
//                     className="w-full pl-4 pr-12 py-3 bg-white rounded-full border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     disabled={!receiver || !isConnected}
//                   />
//                   <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600">
//                     <Smile className="w-5 h-5" />
//                   </button>
//                 </div>

//                 {inputMessage.trim() ? (
//                   <button
//                     onClick={handleSend}
//                     disabled={!receiver || !isConnected}
//                     className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
//                   >
//                     <Send className="w-5 h-5" />
//                   </button>
//                 ) : (
//                   <button className="p-3 text-gray-600 hover:text-green-600">
//                     <Mic className="w-5 h-5" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-50">
//             <div className="text-center">
//               <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
//                 <div className="text-white text-6xl">💬</div>
//               </div>
//               <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Chat</h2>
//               <p className="text-gray-600">Select a conversation to start messaging</p>
//               {notificationPermission === "default" && (
//                 <p className="text-sm text-orange-600 mt-4">
//                   💡 Enable notifications to never miss a message!
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;




import { useEffect, useRef, useState, useMemo } from "react";
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Mic, Settings, LogOut, User, Bell, Plus, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import chatService from "../services/chatservice";

const ChatMessage = () => {
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const messagesEndRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

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
    if (notificationPermission === "granted" && document.hidden) {
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

    const handleMessageSent = (message) => {
      if (message.senderId === receiver?.id || message.receiverId === receiver?.id) {
        setMessages(prev => [...prev, message]);
        setLastMessageTimes(prev => ({ ...prev, [message.receiverId]: message.sentAt }));
        setLastMessages(prev => ({ ...prev, [message.receiverId]: message.message }));
        if ("vibrate" in navigator) navigator.vibrate(50);
      }
    };

    const handleConnectionStateChanged = (connected) => {
      setIsConnected(connected);
    };

    chatService.on("messageReceived", handleMessageReceived);
    chatService.on("messageSent", handleMessageSent);
    chatService.on("connectionStateChanged", handleConnectionStateChanged);

    return () => {
      chatService.off("messageReceived", handleMessageReceived);
      chatService.off("messageSent", handleMessageSent);
      chatService.off("connectionStateChanged", handleConnectionStateChanged);
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
              className={`group flex items-center p-4 m-2 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-md animate-in slide-in-from-left ${
                receiver?.id === user.id 
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border-l-4 border-indigo-500 dark:from-indigo-900/30 dark:to-purple-900/30" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative mr-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getRandomGradient(user.id)} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-slate-400'
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
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      onlineUsers.has(receiver.id) ? 'bg-green-500' : 'bg-slate-400'
                    }`}></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {receiver.firstName} {receiver.lastName}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          {onlineUsers.has(receiver.id) ? 'Online' : 'Active now'}
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                          Connecting...
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 dark:text-slate-400 dark:hover:bg-slate-800">
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
                          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                            isSender
                              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md"
                              : "bg-white text-slate-800 rounded-bl-md border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="break-words leading-relaxed">{msg.message}</div>
                          <div className={`text-xs mt-2 flex items-center justify-end space-x-1 ${
                            isSender ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
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
                    {/* <div className="bg-slate-200 text-slate-600 px-4 py-3 rounded-2xl rounded-bl-md dark:bg-slate-700 dark:text-slate-300">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div> */}
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
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 resize-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-700"
                    disabled={!receiver || !isConnected}
                    style={{ minHeight: '56px', maxHeight: '120px' }}
                  />
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-slate-800/30">
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
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