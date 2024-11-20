import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import {createContext,useContext,useEffect,useRef} from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({children}) => {
    const socket = useRef();
    const {userInfo} = useAppStore();

    useEffect(() => {
        if(userInfo){
            socket.current = io(HOST,{
                withCredentials:true,
                query:{userId: userInfo.id},
            });

            const handleReceiveMessage = (message) => {
                const {
                    selectedChatType,
                    selectedChatData,
                    addMessage,
                    addContactsInDMContacts,
                    updateContactLastMessage,
                    directMessagesContacts
                } = useAppStore.getState();

                // Add message to current chat if selected
                if(selectedChatType === "contact" && 
                    (selectedChatData._id === message.sender._id ||
                    selectedChatData._id === message.recipient._id)
                ){
                    addMessage(message);
                }

                // Update contacts list for new messages
                if (message.sender._id !== userInfo.id) {
                    const existingContact = directMessagesContacts.find(
                        contact => contact._id === message.sender._id
                    );
                    
                    if (!existingContact) {
                        addContactsInDMContacts(message);
                    }
                }

                // Always update last message
                updateContactLastMessage(message);
            };

            const handleReceiveChannelMessage = (message) => {
                const {
                    selectedChatType,
                    selectedChatData,
                    addMessage,
                    addChannelInChannelList,
                    updateChannelLastMessage
                } = useAppStore.getState();

                // Add message to current channel if selected
                if(selectedChatType === "channel" && 
                    selectedChatData._id === message.channelId
                ){
                    addMessage(message);
                }

                // Update channels list
                addChannelInChannelList(message);
                updateChannelLastMessage(message);
            };

            socket.current.on("recieveMessage", handleReceiveMessage);
            socket.current.on("recieve-channel-message", handleReceiveChannelMessage);

            return () => {
                socket.current.off("recieveMessage", handleReceiveMessage);
                socket.current.off("recieve-channel-message", handleReceiveChannelMessage);
                socket.current.disconnect();
            };
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};