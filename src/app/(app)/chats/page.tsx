
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, SendHorizonal, Smile, UserCheck, Archive, Filter, UserPlus, ChevronDown, User, UserX, MessageSquareReply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  dataAiHint?: string;
  assignedTo: string | null;
  labels?: string[];
  messages: Message[];
}

const initialChatsData: Chat[] = [
  {
    id: "CHAT001",
    name: "John Doe",
    lastMessage: "Thanks for your help!",
    timestamp: "10:45 AM",
    unread: 2,
    avatar: "https://placehold.co/40x40.png?text=JD",
    dataAiHint: "user avatar",
    assignedTo: "Alice",
    labels: ["Support", "Urgent"],
    messages: [
      { id: "MSG1-1", sender: "John Doe", text: "Hello, I need help with my recent campaign.", time: "10:40 AM", isOwn: false },
      { id: "MSG1-2", sender: "Alice (Agent)", text: "Hi John, I can help with that. What seems to be the issue?", time: "10:41 AM", isOwn: true },
      { id: "MSG1-3", sender: "John Doe", text: "The delivery rate is very low.", time: "10:42 AM", isOwn: false },
      { id: "MSG1-4", sender: "John Doe", text: "Thanks for your help!", time: "10:45 AM", isOwn: false },
    ]
  },
  {
    id: "CHAT002",
    name: "Jane Smith",
    lastMessage: "I have a question about my order.",
    timestamp: "10:30 AM",
    unread: 0,
    avatar: "https://placehold.co/40x40.png?text=JS",
    dataAiHint: "user avatar",
    assignedTo: "Bob",
    labels: ["Sales Inquiry", "Order"],
    messages: [
        { id: "MSG2-1", sender: "Jane Smith", text: "I have a question about my order.", time: "10:29 AM", isOwn: false },
        { id: "MSG2-2", sender: "Bob (Agent)", text: "Certainly, Jane. What is your order number?", time: "10:30 AM", isOwn: true },
    ]
  },
  {
    id: "CHAT003",
    name: "Support Bot",
    lastMessage: "How can I assist you today?",
    timestamp: "10:15 AM",
    unread: 0,
    avatar: "https://placehold.co/40x40.png?text=SB",
    dataAiHint: "robot avatar",
    assignedTo: "System",
    labels: ["Automated"],
    messages: [
        { id: "MSG3-1", sender: "Support Bot", text: "How can I assist you today?", time: "10:15 AM", isOwn: false },
    ]
  },
  {
    id: "CHAT004",
    name: "Mark Johnson",
    lastMessage: "Is the new feature live yet?",
    timestamp: "09:55 AM",
    unread: 1,
    avatar: "https://placehold.co/40x40.png?text=MJ",
    dataAiHint: "user avatar",
    assignedTo: null,
    labels: ["Feature Request", "Follow-up"],
    messages: [
        { id: "MSG4-1", sender: "Mark Johnson", text: "Is the new feature live yet?", time: "09:54 AM", isOwn: false },
        { id: "MSG4-2", sender: "Mark Johnson", text: "Just checking in on that.", time: "09:55 AM", isOwn: false },
    ]
  },
   {
    id: "CHAT005",
    name: "Emily White",
    lastMessage: "Complaint about service quality.",
    timestamp: "Yesterday",
    unread: 0,
    avatar: "https://placehold.co/40x40.png?text=EW",
    dataAiHint: "user avatar",
    assignedTo: "Carol",
    labels: ["Complaint", "Urgent"],
    messages: [
        { id: "MSG5-1", sender: "Emily White", text: "Complaint about service quality.", time: "Yesterday 02:30PM", isOwn: false },
    ]
  },
];

const teamMembersForAssignment = [
  { id: "agent_alice", name: "Alice" },
  { id: "agent_bob", name: "Bob" },
  { id: "agent_carol", name: "Carol" },
  { id: "agent_dave", name: "Dave (Support Lead)" },
  { id: "agent_system", name: "System" },
];


export default function ChatsPage() {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>(initialChatsData);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatsData[0]?.id || null);
  const [messageInput, setMessageInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string>('all');

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  useEffect(() => {
    // If no chat is selected and there are chats, select the first one from the filtered list.
    const currentlyDisplayedChats = filteredAndSearchedChats;
    if (currentlyDisplayedChats.length > 0 && !selectedChatId) {
      setSelectedChatId(currentlyDisplayedChats[0].id);
    } else if (currentlyDisplayedChats.length === 0 && selectedChatId) {
      // If current selection disappears due to filter, clear selection.
      setSelectedChatId(null);
    }
  }, [searchText, selectedLabelFilter, chats]); // Re-evaluate selection when filters or chats change


  const getUniqueChatLabels = (allChats: Chat[]): string[] => {
    const allLabels = allChats.flatMap(chat => chat.labels || []);
    return Array.from(new Set(allLabels)).sort();
  };
  const uniqueLabels = useMemo(() => getUniqueChatLabels(initialChatsData), [initialChatsData]);


  const filteredAndSearchedChats = useMemo(() => {
    return chats
      .filter(chat => {
        // Label filter
        if (selectedLabelFilter === 'all') return true;
        return chat.labels?.includes(selectedLabelFilter);
      })
      .filter(chat => {
        // Search filter
        const term = searchText.toLowerCase();
        if (!term) return true;
        return chat.name.toLowerCase().includes(term) ||
               chat.lastMessage.toLowerCase().includes(term) ||
               (chat.labels && chat.labels.some(label => label.toLowerCase().includes(term)));
      });
  }, [chats, searchText, selectedLabelFilter]);


  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleArchiveChat = () => {
    if (!selectedChat) return;
    toast({ title: "Archive Chat", description: `Chat with ${selectedChat.name} would be archived.` });
  };

  const assignChatToMember = (memberName: string | null) => {
    if (!selectedChat) return;
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat.id ? { ...chat, assignedTo: memberName } : chat
      )
    );
    toast({
      title: memberName ? "Chat Assigned" : "Chat Unassigned",
      description: memberName ? `Chat with ${selectedChat.name} assigned to ${memberName}.` : `Chat with ${selectedChat.name} is now unassigned.`,
    });
  };

  const handleAddEmoji = () => {
    toast({ title: "Add Emoji", description: "Emoji picker would open here." });
  };

  const handleAttachFile = () => {
    toast({ title: "Attach File", description: "File attachment dialog would open here." });
  };

  const handleSendMessage = () => {
    if (!selectedChat || !messageInput.trim()) return;

    const newMessage: Message = {
      id: `MSG${Date.now()}`,
      sender: "You (Agent)",
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === selectedChat.id) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage.text,
            timestamp: newMessage.time,
            unread: chat.unread > 0 && chat.name !== "Support Bot" ? 0 : chat.unread, // Mark as read if agent sends a message
          };
        }
        return chat;
      })
    );
    
    setMessageInput("");
  };


  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))] gap-6">
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="font-headline">Inboxes</CardTitle>
          <CardDescription>Manage conversations with your audience.</CardDescription>
          <div className="flex flex-col gap-2 pt-2">
            <Input 
              placeholder="Search chats by name, message, label..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select value={selectedLabelFilter} onValueChange={setSelectedLabelFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labels</SelectItem>
                {uniqueLabels.map(label => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="p-0">
            {filteredAndSearchedChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-start gap-3 p-3 border-b hover:bg-muted/50 cursor-pointer ${selectedChatId === chat.id ? 'bg-muted' : ''}`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.dataAiHint} />
                  <AvatarFallback>{chat.name.split(" ").map(n=>n[0]).join("").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{chat.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {chat.assignedTo ? (
                            <span className="flex items-center">
                                <UserCheck className="h-3 w-3 mr-1 text-green-500"/> {chat.assignedTo}
                            </span>
                        ) : (
                             <span className="flex items-center text-orange-500">
                                <UserPlus className="h-3 w-3 mr-1"/> Unassigned
                            </span>
                        )}
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {chat.labels?.slice(0,2).map(label => ( // Show max 2 labels for brevity
                            <Badge key={label} variant="outline" className="text-xs px-1 py-0">{label}</Badge>
                        ))}
                    </div>
                  </div>
                </div>
                {chat.unread > 0 && <Badge className="h-5 px-1.5 text-xs ml-auto self-center">{chat.unread}</Badge>}
              </div>
            ))}
            {filteredAndSearchedChats.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">No chats match your filters.</p>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {selectedChat ? (
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline">{selectedChat.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                    {selectedChat.assignedTo ? (
                        <CardDescription className="flex items-center">
                            Assigned to: {selectedChat.assignedTo} <UserCheck className="ml-1.5 inline h-4 w-4 text-green-500" />
                        </CardDescription>
                    ) : (
                        <CardDescription className="flex items-center text-orange-500">
                            Status: Unassigned <UserPlus className="ml-1.5 inline h-4 w-4" />
                        </CardDescription>
                    )}
                    <div className="flex flex-wrap gap-1">
                        {selectedChat.labels?.map(label => (
                            <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
                        ))}
                    </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleArchiveChat} aria-label="Archive chat"><Archive className="h-4 w-4" /></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {selectedChat.assignedTo ? `Change Assignee` : 'Assign Chat'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Assign to Team Member</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {teamMembersForAssignment.map((member) => (
                      <DropdownMenuItem key={member.id} onSelect={() => assignChatToMember(member.name)}>
                        <User className="mr-2 h-4 w-4" />
                        {member.name}
                      </DropdownMenuItem>
                    ))}
                    {selectedChat.assignedTo && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => assignChatToMember(null)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <UserX className="mr-2 h-4 w-4" />
                          Unassign
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-4 space-y-4 bg-muted/30">
              {selectedChat.messages.map((msg)=>(
                   <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${msg.isOwn ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"} text-right`}>{msg.time}</p>
                      </div>
                   </div>
              ))}
          </ScrollArea>
          <CardContent className="p-4 border-t bg-background">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleAddEmoji} aria-label="Add emoji"><Smile className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleAttachFile} aria-label="Attach file"><Paperclip className="h-5 w-5" /></Button>
              <Input
                placeholder="Type your message..."
                className="flex-1"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
              />
              <Button onClick={handleSendMessage} aria-label="Send message"><SendHorizonal className="h-5 w-5" /></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center bg-muted/30">
            <MessageSquareReply className="h-16 w-16 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground">Select a chat to view messages or clear filters.</p>
            {filteredAndSearchedChats.length === 0 && chats.length > 0 && (
                 <p className="text-sm text-muted-foreground mt-2">No chats match your current search/filter criteria.</p>
            )}
            {chats.length === 0 && <p className="text-sm text-muted-foreground mt-2">No chats available.</p>}
        </Card>
      )}
    </div>
  );
}
