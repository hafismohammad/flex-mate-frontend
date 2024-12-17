import axios from "axios";
import { useEffect, useState } from "react";
import API_URL from "../../axios/API_URL";

interface Message {
  conversationId: string;
  createdAt: string;
  message: string;
  receiverId: string;
  receiverModel: string;
  senderId: string;
  senderModel: "user" | "trainer";
  updatedAt: string;
  _id: string;
}

const useGetMessage = (token: string, id: string) => {
  // console.log('get data', token, '=====',id);

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // console.log('messages', messages);

  useEffect(() => {
    const getMessage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/messages/${token}/${id}`
        );

        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) getMessage();
  }, [token, id, setMessages]);

  return { messages, loading };
};

export default useGetMessage;
