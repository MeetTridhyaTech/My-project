// import { useEffect, useRef, useState, useMemo } from "react";
// import * as signalR from "@microsoft/signalr";
// import api from "./axiosInstance";
// import Sidebar from "./Sidebar";
// import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Mic } from "lucide-react";

// const ChatMessage = () => {
//     const [users, setUsers] = useState([]);
//     const [receiver, setReceiver] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [inputMessage, setInputMessage] = useState("");
//     const [isConnected, setIsConnected] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [notificationPermission, setNotificationPermission] = useState("default");
//     const [lastMessageTimes, setLastMessageTimes] = useState({});

//     const connectionRef = useRef(null);
//     const messagesEndRef = useRef(null);
//     const notificationSoundRef = useRef(null);

//     const userId = localStorage.getItem("userId");
//     const token = localStorage.getItem("token");
//     const CHAT_MENU_ID = "17DEC13F-8C9F-4287-A918-774375AC1B76";

//     // Notification setup
//     useEffect(() => {
//         if ("Notification" in window && Notification.permission === "default") {
//             Notification.requestPermission().then(permission => {
//                 setNotificationPermission(permission);
//             });
//         } else if ("Notification" in window) {
//             setNotificationPermission(Notification.permission);
//         }

//         notificationSoundRef.current = new Audio();
//         notificationSoundRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMFl2+z9N6QQAYfXrTp66hVFApGn+DyvmwhBz2Zz+/Phy4IL3m69N+2UC8K";
//         notificationSoundRef.current.volume = 0.3;

//         return () => {
//             if (notificationSoundRef.current) {
//                 notificationSoundRef.current = null;
//             }
//         };
//     }, []);

//     const playNotificationSound = () => {
//         if (notificationSoundRef.current) {
//             notificationSoundRef.current.currentTime = 0;
//             notificationSoundRef.current.play().catch(console.error);
//         }
//     };

//     const showNotification = (title, body) => {
//         if (notificationPermission === "granted" && document.hidden) {
//             const notification = new Notification(title, { body });
//             setTimeout(() => notification.close(), 4000);
//             notification.onclick = () => {
//                 window.focus();
//                 notification.close();
//             };
//         }
//     };

//     const vibrate = () => {
//         if ("vibrate" in navigator) {
//             navigator.vibrate([200, 100, 200]);
//         }
//     };

//     // Fetch users and their last message times
//     useEffect(() => {
//         const fetchUsersAndLastMessages = async () => {
//             try {
//                 const res = await api.post(
//                     `user/search/${CHAT_MENU_ID}`,
//                     {},
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );

//                 const filtered = res.data.data.filter(u => u.id !== userId);
//                 const times = {};

//                 // Fetch last message for each user
//                 for (const user of filtered) {
//                     try {
//                         const historyRes = await api.get(`chat/history/${user.id}`, {
//                             headers: { Authorization: `Bearer ${token}` },
//                         });
//                         if (historyRes.data.length > 0) {
//                             const lastMsg = historyRes.data.reduce((latest, current) =>
//                                 new Date(current.sentAt) > new Date(latest.sentAt) ? current : latest
//                             );
//                             times[user.id] = lastMsg.sentAt;
//                         }
//                     } catch (err) {
//                         console.error(`Error fetching history for user ${user.id}:`, err);
//                     }
//                 }

//                 setLastMessageTimes(times);
//                 setUsers(filtered);
//             } catch (err) {
//                 console.error("Failed to fetch users:", err);
//             }
//         };

//         fetchUsersAndLastMessages();
//     }, [token, userId]);

//     // SignalR connection
//     useEffect(() => {
//         if (!receiver || !token || !userId) return;

//         const connectSignalR = async () => {
//             try {
//                 connectionRef.current = new signalR.HubConnectionBuilder()
//                     .withUrl(`https://localhost:7047/chathub?access_token=${token}&userId=${userId}`)
//                     .withAutomaticReconnect()
//                     .build();

//                 connectionRef.current.on("ReceiveMessage", (message) => {
//                     if (message.senderId === receiver.id || message.receiverId === receiver.id) {
//                         setMessages(prev => [...prev, message]);

//                         // Update last message time
//                         const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
//                         setLastMessageTimes(prev => ({ ...prev, [otherUserId]: message.sentAt }));

//                         if (message.senderId !== userId) {
//                             const sender = users.find(u => u.id === message.senderId);
//                             showNotification(
//                                 sender ? `${sender.firstName} ${sender.lastName}` : "New message",
//                                 message.message
//                             );
//                             playNotificationSound();
//                             vibrate();
//                         }
//                     }
//                 });

//                 connectionRef.current.on("MessageSent", (message) => {
//                     if (message.senderId === receiver.id || message.receiverId === receiver.id) {
//                         setMessages(prev => [...prev, message]);
//                         setLastMessageTimes(prev => ({ ...prev, [message.receiverId]: message.sentAt }));
//                         if ("vibrate" in navigator) navigator.vibrate(50);
//                     }
//                 });

//                 await connectionRef.current.start();
//                 setIsConnected(true);

//                 const res = await api.get(`chat/history/${receiver.id}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setMessages(res.data);
//             } catch (err) {
//                 console.error("SignalR connection failed:", err);
//             }
//         };

//         connectSignalR();

//         return () => {
//             if (connectionRef.current) {
//                 connectionRef.current.stop().catch(err => console.error("SignalR stop error:", err));
//             }
//         };
//     }, [receiver, token, userId, users]);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     // Sort users by last message time (WhatsApp-style)
//     const sortedFilteredUsers = useMemo(() => {
//         return [...users]
//             .filter(user => `${user.firstName} ${user.lastName}`
//                 .toLowerCase()
//                 .includes(searchTerm.toLowerCase()))
//             .sort((a, b) => {
//                 const timeA = lastMessageTimes[a.id] || 0;
//                 const timeB = lastMessageTimes[b.id] || 0;

//                 if (timeA && timeB) return new Date(timeB) - new Date(timeA);
//                 if (timeA && !timeB) return -1;
//                 if (!timeA && timeB) return 1;
//                 return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
//             });
//     }, [users, searchTerm, lastMessageTimes]);

//     const handleSend = async () => {
//         if (!inputMessage.trim() || !receiver) return;
//         if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) return;

//         try {
//             await connectionRef.current.invoke("SendMessage", receiver.id, inputMessage);
//             setInputMessage("");
//             if ("vibrate" in navigator) navigator.vibrate(30);
//         } catch (err) {
//             console.error("Send error:", err);
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSend();
//         }
//     };

//     const formatTime = (date) => {
//         const utcDate = new Date(date);
//         return new Intl.DateTimeFormat('en-IN', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true,
//             timeZone: 'Asia/Kolkata'
//         }).format(utcDate);
//     };

//     const formatLastSeen = (date) => {
//         const now = new Date();
//         const messageDate = new Date(date);
//         const diffDays = Math.ceil((now - messageDate) / (1000 * 60 * 60 * 24));

//         if (diffDays === 1) return 'Today';
//         if (diffDays === 2) return 'Yesterday';
//         if (diffDays <= 7) return messageDate.toLocaleDateString([], { weekday: 'short' });
//         return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
//     };

//     return (
//         <div className="flex h-screen bg-gray-50">
//             <Sidebar activePage="chatmessage" />

//             {/* Chat List Panel */}
//             <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
//                 <div className="bg-gray-50 p-4 border-b border-gray-200">
//                     <div className="flex items-center justify-between mb-4">
//                         <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
//                         <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
//                     </div>

//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                             type="text"
//                             placeholder="Search conversations"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none outline-none focus:bg-white focus:ring-2 focus:ring-green-500"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto">
//                     {sortedFilteredUsers.map((user) => (
//                         <div
//                             key={user.id}
//                             onClick={() => setReceiver(user)}
//                             className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${receiver?.id === user.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
//                                 }`}
//                         >
//                             <div className="relative mr-3">
//                                 <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
//                                     {user.firstName[0]}{user.lastName[0]}
//                                 </div>
//                                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                             </div>

//                             <div className="flex-1 min-w-0">
//                                 <div className="flex items-center justify-between">
//                                     <h3 className="font-semibold text-gray-900 truncate">
//                                         {user.firstName} {user.lastName}
//                                     </h3>
//                                     <span className="text-xs text-gray-500">
//                                         {lastMessageTimes[user.id] ? formatLastSeen(lastMessageTimes[user.id]) : formatLastSeen(user.lastSeen || new Date())}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center justify-between">
//                                     <p className="text-sm text-gray-500 truncate">
//                                         {
//                                             lastMessageTimes[user.id]
//                                                 ? messages.find(m => m.sentAt === lastMessageTimes[user.id])?.message
//                                                 : "No messages yet"
//                                         }
//                                     </p>

//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Chat Window */}
//             <div className="flex-1 flex flex-col">
//                 {receiver ? (
//                     <>
//                         <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
//                             <div className="flex items-center">
//                                 <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
//                                     {receiver.firstName[0]}{receiver.lastName[0]}
//                                 </div>
//                                 <div>
//                                     <h2 className="font-semibold text-gray-900">
//                                         {receiver.firstName} {receiver.lastName}
//                                     </h2>
//                                     <p className="text-sm text-gray-500">
//                                         {isConnected ? "Online" : "Connecting..."}
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center space-x-4">
//                                 <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
//                                 <Video className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
//                                 <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
//                             </div>
//                         </div>

//                         <div className="flex-1 overflow-y-auto p-4 bg-gray-50 bg-opacity-30" style={{
//                             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//                         }}>
//                             <div className="max-w-4xl mx-auto">
//                                 {messages.map((msg) => {
//                                     const isSender = msg.senderId?.toLowerCase() === userId?.toLowerCase();
//                                     return (
//                                         <div
//                                             key={msg.id || `${msg.senderId}-${msg.sentAt}`}
//                                             className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
//                                         >
//                                             <div
//                                                 className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${isSender
//                                                         ? "bg-green-500 text-white rounded-br-sm"
//                                                         : "bg-white text-gray-800 rounded-bl-sm"
//                                                     }`}
//                                             >
//                                                 <div className="break-words">{msg.message}</div>
//                                                 <div className={`text-xs mt-1 ${isSender ? "text-green-100" : "text-gray-500"} text-right`}>
//                                                     {msg.sentAt ? formatTime(msg.sentAt) : "Sending..."}
//                                                     <span className="ml-1">✓✓</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                                 <div ref={messagesEndRef} />
//                             </div>
//                         </div>

//                         <div className="bg-gray-50 p-4 border-t border-gray-200">
//                             <div className="flex items-end space-x-2">
//                                 <button className="p-2 text-gray-600 hover:text-green-600">
//                                     <Paperclip className="w-5 h-5" />
//                                 </button>

//                                 <div className="flex-1 relative">
//                                     <input
//                                         type="text"
//                                         value={inputMessage}
//                                         onChange={(e) => setInputMessage(e.target.value)}
//                                         onKeyPress={handleKeyPress}
//                                         placeholder="Type a message..."
//                                         className="w-full pl-4 pr-12 py-3 bg-white rounded-full border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                         disabled={!receiver || !isConnected}
//                                     />
//                                     <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600">
//                                         <Smile className="w-5 h-5" />
//                                     </button>
//                                 </div>

//                                 {inputMessage.trim() ? (
//                                     <button
//                                         onClick={handleSend}
//                                         disabled={!receiver || !isConnected}
//                                         className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
//                                     >
//                                         <Send className="w-5 h-5" />
//                                     </button>
//                                 ) : (
//                                     <button className="p-3 text-gray-600 hover:text-green-600">
//                                         <Mic className="w-5 h-5" />
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex-1 flex items-center justify-center bg-gray-50">
//                         <div className="text-center">
//                             <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
//                                 <div className="text-white text-6xl">💬</div>
//                             </div>
//                             <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Chat</h2>
//                             <p className="text-gray-600">Select a conversation to start messaging</p>
//                             {notificationPermission === "default" && (
//                                 <p className="text-sm text-orange-600 mt-4">
//                                     💡 Enable notifications to never miss a message!
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ChatMessage;



import { useEffect, useRef, useState, useMemo } from "react";
import * as signalR from "@microsoft/signalr";
import api from "./axiosInstance";
import Sidebar from "./Sidebar";
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Mic, LogOut, User, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatMessage = () => {
    const [users, setUsers] = useState([]);
    const [receiver, setReceiver] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [notificationPermission, setNotificationPermission] = useState("default");
    const [lastMessageTimes, setLastMessageTimes] = useState({});
    const [lastMessages, setLastMessages] = useState({}); // New state for storing last messages
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    const connectionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const notificationSoundRef = useRef(null);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const CHAT_MENU_ID = "17DEC13F-8C9F-4287-A918-774375AC1B76";

      const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

      useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
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
                const res = await api.post(
                    `user/search/${CHAT_MENU_ID}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const filtered = res.data.data.filter(u => u.id !== userId);
                const times = {};
                const lastMsgs = {};

                // Fetch last message for each user
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

                setLastMessageTimes(times);
                setLastMessages(lastMsgs);
                setUsers(filtered);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };

        fetchUsersAndLastMessages();
    }, [token, userId]);

    // SignalR connection
    useEffect(() => {
        if (!receiver || !token || !userId) return;

        const connectSignalR = async () => {
            try {
                connectionRef.current = new signalR.HubConnectionBuilder()
                    .withUrl(`https://localhost:7047/chathub?access_token=${token}&userId=${userId}`)
                    .withAutomaticReconnect()
                    .build();

                connectionRef.current.on("ReceiveMessage", (message) => {
                    if (message.senderId === receiver.id || message.receiverId === receiver.id) {
                        setMessages(prev => [...prev, message]);

                        // Update last message time and content
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
                });

                connectionRef.current.on("MessageSent", (message) => {
                    if (message.senderId === receiver.id || message.receiverId === receiver.id) {
                        setMessages(prev => [...prev, message]);
                        setLastMessageTimes(prev => ({ ...prev, [message.receiverId]: message.sentAt }));
                        setLastMessages(prev => ({ ...prev, [message.receiverId]: message.message }));
                        if ("vibrate" in navigator) navigator.vibrate(50);
                    }
                });

                await connectionRef.current.start();
                setIsConnected(true);

                const res = await api.get(`chat/history/${receiver.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(res.data);
            } catch (err) {
                console.error("SignalR connection failed:", err);
            }
        };

        connectSignalR();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop().catch(err => console.error("SignalR stop error:", err));
            }
        };
    }, [receiver, token, userId, users]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Sort users by last message time (WhatsApp-style)
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
        if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) return;

        try {
            await connectionRef.current.invoke("SendMessage", receiver.id, inputMessage);
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

    // Truncate long last messages
    const truncateLastMessage = (msg) => {
        if (!msg) return '';
        return msg.length > 30 ? `${msg.substring(0, 30)}...` : msg;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar activePage="chatmessage" />

            {/* Chat List Panel */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
                        <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none outline-none focus:bg-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sortedFilteredUsers.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => setReceiver(user)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${receiver?.id === user.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
                                }`}
                        >
                            <div className="relative mr-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {lastMessageTimes[user.id] ? formatLastSeen(lastMessageTimes[user.id]) : formatLastSeen(user.lastSeen || new Date())}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500 truncate">
                                        {lastMessages[user.id] ? truncateLastMessage(lastMessages[user.id]) : "No Messages Yet"}
                                    </p>
                                    {/* Unread count badge can be added here */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
                {receiver ? (
                    <>
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                    {receiver.firstName[0]}{receiver.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {receiver.firstName} {receiver.lastName}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {isConnected ? "Online" : "Connecting..."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Phone className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
                                <Video className="w-5 h-5 text-gray-600 cursor-pointer hover:text-green-600" />
                                <div className="relative" ref={settingsRef}>
                                    <button
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className="p-1 rounded-full hover:bg-gray-200"
                                    >
                                        <MoreVertical className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {isSettingsOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                            <button
                                                onClick={() => {
                                                    setIsSettingsOpen(false);
                                                    console.log("Profile clicked");
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsSettingsOpen(false);
                                                    console.log("Dark Mode clicked");
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <Moon className="w-4 h-4 mr-2" />
                                                Dark Mode
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 bg-opacity-30" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}>
                            <div className="max-w-4xl mx-auto">
                                {messages.map((msg) => {
                                    const isSender = msg.senderId?.toLowerCase() === userId?.toLowerCase();
                                    return (
                                        <div
                                            key={msg.id || `${msg.senderId}-${msg.sentAt}`}
                                            className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${isSender
                                                        ? "bg-green-500 text-white rounded-br-sm"
                                                        : "bg-white text-gray-800 rounded-bl-sm"
                                                    }`}
                                            >
                                                <div className="break-words">{msg.message}</div>
                                                <div className={`text-xs mt-1 ${isSender ? "text-green-100" : "text-gray-500"} text-right`}>
                                                    {msg.sentAt ? formatTime(msg.sentAt) : "Sending..."}
                                                    <span className="ml-1">✓✓</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-200">
                            <div className="flex items-end space-x-2">
                                <button className="p-2 text-gray-600 hover:text-green-600">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        className="w-full pl-4 pr-12 py-3 bg-white rounded-full border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={!receiver || !isConnected}
                                    />
                                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>

                                {inputMessage.trim() ? (
                                    <button
                                        onClick={handleSend}
                                        disabled={!receiver || !isConnected}
                                        className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button className="p-3 text-gray-600 hover:text-green-600">
                                        <Mic className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <div className="text-white text-6xl">💬</div>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Chat</h2>
                            <p className="text-gray-600">Select a conversation to start messaging</p>
                            {notificationPermission === "default" && (
                                <p className="text-sm text-orange-600 mt-4">
                                    💡 Enable notifications to never miss a message!
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;