import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider = ({children}) => {
    const socketRef = useRef();
    const typingTimeoutRef = useRef();
    const {userInfo} = useAppStore();

    const emitTyping = (recipientId, isTyping) => {
        if (socketRef.current) {
            socketRef.current.emit("typing", {
                userId: userInfo?.id,
                recipientId,
                isTyping
            });
        }
    };

    const handleTyping = (recipientId) => {
        emitTyping(recipientId, true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitTyping(recipientId, false);
        }, 2000);
    };

    useEffect(() => {
        if(userInfo){
            socketRef.current = io(HOST,{
                withCredentials:true,
                query:{userId: userInfo.id},
            });

            socketRef.current.on("online_users", ({online, lastSeen}) => {
                const { setOnlineUsers, setLastSeenTimes } = useAppStore.getState();
                setOnlineUsers(new Set(online));
                setLastSeenTimes(lastSeen);
            });

            socketRef.current.on("typing_status", ({userId, isTyping}) => {
                const { updateTypingStatus } = useAppStore.getState();
                updateTypingStatus(userId, isTyping);
            });

            socketRef.current.on("user_status_change", ({userId, status, lastSeen}) => {
                const { updateUserStatus } = useAppStore.getState();
                updateUserStatus(userId, status, lastSeen);
            });

            socketRef.current.on("recieveMessage", (message) => {
                const {
                    selectedChatType,
                    selectedChatData,
                    addMessage,
                    addContactsInDMContacts,
                    updateContactLastMessage,
                    directMessagesContacts
                } = useAppStore.getState();

                if(selectedChatType === "contact" && 
                    (selectedChatData._id === message.sender._id ||
                    selectedChatData._id === message.recipient._id)
                ){
                    addMessage(message);
                }

                if (message.sender._id !== userInfo.id) {
                    const existingContact = directMessagesContacts.find(
                        contact => contact._id === message.sender._id
                    );
                    
                    if (!existingContact) {
                        addContactsInDMContacts(message);
                    }
                }

                updateContactLastMessage(message);
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.off("online_users");
                    socketRef.current.off("typing_status");
                    socketRef.current.off("user_status_change");
                    socketRef.current.off("recieveMessage");
                    socketRef.current.disconnect();
                }
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
            };
        }
    }, [userInfo]);

    const value = {
        socket: socketRef.current,
        handleTyping
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};