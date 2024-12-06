export const createChatSlice = (set,get) => ({
    selectedChatType:undefined,
    selectedChatData:undefined,
    selectedChatMessages:[],
    directMessagesContacts:[],
    isUploading:false,
    isDownloading:false,
    fileUploadProgress:0,
    fileDownloadProgress:0,
    channels: [],
    onlineUsers: new Set(),
    setChannels: (channels) => set({channels}),
    setIsUploading: (isUploading) => set({isUploading}),
    setIsDownloading: (isDownloading) => set({isDownloading}),
    setFileUploadProgress: (fileUploadProgress) => set({fileUploadProgress}),
    setFileDownloadProgress: (fileDownloadProgress) => set({fileDownloadProgress}),
    setSelectedChatType: (selectedChatType) => set({selectedChatType}),
    setSelectedChatData: (selectedChatData) => set({selectedChatData}),
    setSelectedChatMessages: (selectedChatMessages) =>
        set({selectedChatMessages}),
    setDirectMessagesContacts: (directMessagesContacts) =>
        set({directMessagesContacts}),
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    updateUserStatus: (userId, status) => {
        const onlineUsers = new Set(get().onlineUsers);
        if (status === "online") {
            onlineUsers.add(userId);
        } else {
            onlineUsers.delete(userId);
        }
        set({ onlineUsers });
    },
    addChannel: (channel) => {
        const channels = get().channels;
        set({channels: [channel, ...channels]});
    },
    closeChat:() => 
        set({
            selectedChatData:undefined,
            selectedChatType:undefined,
            selectedChatMessages:[],
        }),
    addMessage: (message) => {
        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set({
            selectedChatMessages: [
                ...selectedChatMessages,
                {
                    ...message,
                    recipient:
                        selectedChatType === "channel"
                        ? message.recipient
                        : message.recipient._id,
                    sender:
                        selectedChatType === "channel"
                        ? message.sender
                        : message.sender._id,
                },
            ],
        });
    },
    addChannelInChannelList: (message) => {
        const channels = [...get().channels];
        const channelIndex = channels.findIndex(
            channel => channel._id === message.channelId
        );

        if (channelIndex !== -1) {
            const channel = channels[channelIndex];
            channels.splice(channelIndex, 1);
            channels.unshift(channel);
            set({ channels: channels });
        }
    },

    addContactsInDMContacts: (message) => {
        const userId = get().userInfo.id;
        const fromId = message.sender._id === userId ? 
            message.recipient._id : message.sender._id;
        const fromData = message.sender._id === userId ? 
            message.recipient : message.sender;
        
        const dmContacts = [...get().directMessagesContacts];
        const contactIndex = dmContacts.findIndex(
            contact => contact._id === fromId
        );

        if (contactIndex !== -1) {
            // Update existing contact
            dmContacts.splice(contactIndex, 1);
            fromData.lastMessage = message;
            dmContacts.unshift(fromData);
        } else {
            // Add new contact
            fromData.lastMessage = message;
            dmContacts.unshift(fromData);
        }
        
        set({ directMessagesContacts: dmContacts });
    },

    updateContactLastMessage: (message) => {
        const dmContacts = [...get().directMessagesContacts];
        const userId = get().userInfo.id;
        const contactId = message.sender._id === userId ? 
            message.recipient._id : message.sender._id;

        const contactIndex = dmContacts.findIndex(
            contact => contact._id === contactId
        );

        if (contactIndex !== -1) {
            // Move contact to top and update last message
            const contact = dmContacts[contactIndex];
            dmContacts.splice(contactIndex, 1);
            contact.lastMessage = message;
            dmContacts.unshift(contact);
            set({ directMessagesContacts: dmContacts });
        }
    },

    updateChannelLastMessage: (message) => {
        const channels = [...get().channels];
        const channelIndex = channels.findIndex(
            channel => channel._id === message.channelId
        );

        if (channelIndex !== -1) {
            // Move channel to top and update last message
            const channel = channels[channelIndex];
            channels.splice(channelIndex, 1);
            channel.lastMessage = message;
            channels.unshift(channel);
            set({ channels: channels });
        }
    },
});