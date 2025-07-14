"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/api";

type ChatType = 'expert-seller' | 'expert-buyer' | null;

interface ChatContextType {
  activeChat: {
    id: string | null;
    type: ChatType;
  };
  bookingChats: {
    expertSeller: string | null;
    expertBuyer: string | null;
  };
  setActiveChat: (id: string, type: ChatType) => void;
  initBookingChats: (bookingId: string) => Promise<{
    expertSeller: string | null;
    expertBuyer: string | null;
  }>;
  getChatParticipants: (chatId: string) => Promise<string[]>;
}

const ChatContext = createContext<ChatContextType>({
  activeChat: { id: null, type: null },
  bookingChats: { expertSeller: null, expertBuyer: null },
  setActiveChat: () => {},
  initBookingChats: async () => ({ expertSeller: null, expertBuyer: null }),
  getChatParticipants: async () => []
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChat, setActiveChat] = useState<{
    id: string | null;
    type: ChatType;
  }>({ id: null, type: null });

  const [bookingChats, setBookingChats] = useState<{
    expertSeller: string | null;
    expertBuyer: string | null;
  }>({ expertSeller: null, expertBuyer: null });

  // Load chat state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('chatState');
    if (savedState) {
      try {
        const { activeChat, bookingChats } = JSON.parse(savedState);
        setActiveChat(activeChat);
        setBookingChats(bookingChats);
      } catch (e) {
        console.error("Failed to load chat state", e);
      }
    }
  }, []);

  // Save chat state to localStorage when it changes
  useEffect(() => {
    const state = { activeChat, bookingChats };
    localStorage.setItem('chatState', JSON.stringify(state));
  }, [activeChat, bookingChats]);

  const initBookingChats = async (bookingId: string) => {
    try {
      const response = await api.post('/chats/init-booking-chats', { bookingId });
      const newState = {
        expertSeller: response.data.chats.expertSellerChat._id,
        expertBuyer: response.data.chats.expertBuyerChat._id
      };
      setBookingChats(newState);
      setActiveChat({
        id: response.data.chats.expertSellerChat._id,
        type: 'expert-seller'
      });
      return newState;
    } catch (error) {
      console.error('Failed to initialize booking chats:', error);
      throw error;
    }
  };

  const getChatParticipants = async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}/participants`);
      return response.data.participants;
    } catch (error) {
      console.error('Failed to fetch chat participants:', error);
      return [];
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeChat,
        bookingChats,
        setActiveChat: (id, type) => setActiveChat({ id, type }),
        initBookingChats,
        getChatParticipants
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);