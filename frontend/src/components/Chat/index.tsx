"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useChat } from "@/app/context/ChatContext";
import api from "@/api";

export default function ChatWidget() {
  const {
    activeChat,
    bookingChats,
    setActiveChat,
    getChatParticipants
  } = useChat();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat.id || !isOpen) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [messagesRes, participantsRes] = await Promise.all([
          api.get(`/chats/${activeChat.id}/messages`),
          getChatParticipants(activeChat.id)
        ]);

        setMessages(messagesRes.data.messages);
        
        // Create participants map for quick lookup
        const participantsMap = participantsRes.reduce((acc: any, user: any) => {
          acc[user._id] = user;
          return acc;
        }, {});
        setParticipants(participantsMap);
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeChat.id, isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat.id) return;

    try {
      const response = await api.post(`/chats/${activeChat.id}/messages`, {
        content: newMessage
      });

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
      {/* Chat header with tabs */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChat(bookingChats.expertSeller!, 'expert-seller')}
            className={`px-3 py-1 rounded text-sm ${activeChat.type === 'expert-seller' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}
          >
            Expert ↔ Seller
          </button>
          <button
            onClick={() => setActiveChat(bookingChats.expertBuyer!, 'expert-buyer')}
            className={`px-3 py-1 rounded text-sm ${activeChat.type === 'expert-buyer' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}
          >
            Expert ↔ Buyer
          </button>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-3 overflow-y-auto max-h-96">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`mb-3 flex ${message.sender._id === participants[message.sender._id]?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${message.sender._id === participants[message.sender._id]?._id ? 'bg-blue-100 rounded-br-none' : 'bg-gray-100 rounded-bl-none'}`}
              >
                <p className="text-sm font-medium text-gray-800">
                  {participants[message.sender._id]?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-700">{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <div className="p-3 border-t flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="ml-2 p-2 bg-blue-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}