
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@/types/chat";

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
}

export function ChatList({ chats, onSelectChat }: ChatListProps) {
  return (
    <div className="w-1/4 border-r">
      <div className="p-4">
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="p-4 border-b cursor-pointer hover:bg-gray-100"
            onClick={() => onSelectChat(chat)}
          >
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={chat.contact.avatar} />
                <AvatarFallback>{chat.contact.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-bold">{chat.contact.name}</p>
                <p className="text-sm text-gray-500">{chat.lastMessage?.content}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
