import { useAppStore } from "@/store"
import { Avatar, AvatarImage } from "./ui/avatar";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";

const ContactList = ({contacts,isChannel = false}) => {

    const {selectedChatData,selectedChatType,setSelectedChatData,setSelectedChatType,setSelectedChatMessages,onlineUsers,lastSeenTimes,typingUsers} = useAppStore();

    const handleClick = (contact) => {
        if(isChannel) setSelectedChatType("channel");
        else setSelectedChatType("contact");
        setSelectedChatData(contact);
        if(selectedChatData && selectedChatData._id !== contact._id){
            setSelectedChatMessages([]);
        }
    };

    const formatLastSeen = (timestamp) => {
        const now = new Date();
        const lastSeen = new Date(timestamp);
        const diffMinutes = Math.floor((now - lastSeen) / 1000 / 60);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes/60)}h ago`;
        return `${Math.floor(diffMinutes/1440)}d ago`;
    };

    return (
        <div className="mt-5">
        {contacts.map((contact) => (
            <div key={contact._id} className={`pl-10 py-2 transition-all duration-300 cursor-pointer relative ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#8417ff] hover:bg-[#8417ff]" : "hover:bg-[#f1f1f111]" }`} onClick={() =>handleClick(contact)}>
                <div className="flex gap-5 items-center justify-start text-neutral-300">
                    {
                        !isChannel && (
                            <div className="relative">
                                <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                    {contact.image ? (
                                        <AvatarImage
                                        src={`${HOST}/${contact.image}`}
                                        alt="profile"
                                        className="object-cover w-full h-full bg-black"
                                        />
                                    ) : (
                                        <div
                                        className={`
                                            ${
                                                selectedChatData &&
                                                selectedChatData._id === contact._id
                                                ? "bg-[#ffffff22] border border-white/70"
                                                : getColor(contact.color)
                                            }
                                            uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                                        >
                                        {contact.firstName
                                            ? contact.firstName.split("").shift()
                                            : contact.email.split("").shift()}
                                        </div>
                                    )}
                                </Avatar>
                                <span 
                                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                        onlineUsers.has(contact._id) 
                                            ? 'bg-green-500' 
                                            : 'bg-gray-500'
                                    }`}
                                />
                            </div>
                        )
                    }
                    {
                        isChannel && (
                            <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                                #
                            </div>
                        )
                    }
                    {
                        isChannel ? (
                            <span>{contact.name}</span>
                        ) : (
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email}
                                </span>
                                {!isChannel && (
                                    <div className="flex flex-col">
                                        <span className="text-xs">
                                            {typingUsers.has(contact._id) ? (
                                                <span className="text-green-400 animate-pulse">
                                                    typing...
                                                </span>
                                            ) : onlineUsers.has(contact._id) ? (
                                                <span className="text-green-400">
                                                    online
                                                </span>
                                            ) : lastSeenTimes[contact._id] ? (
                                                <span className="text-gray-400">
                                                    last seen {formatLastSeen(lastSeenTimes[contact._id])}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    offline
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
        ))}
        </div>
    )
}

export default ContactList
