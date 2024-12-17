import { useState } from "react";
import axios from "axios";
import API_URL from "../../axios/API_URL";

interface SendMessageParams {
  message: string;
  receiverId: string;
  token: string;
}

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);

  const sendMessage = async ({ message, receiverId, token }: SendMessageParams) => {
    setLoading(true);
    try {
        // console.log(message,'--',receiverId,'--', token);
        
      // Correct axios.post call by passing the data as an object
      const response = await axios.post(`${API_URL}/api/messages/send`, {
        message,
        receiverId,
        token
      });

      // Handle response here if needed
      console.log(response.data);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
