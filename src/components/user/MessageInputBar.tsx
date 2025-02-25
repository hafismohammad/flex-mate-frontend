import React, { useEffect, useState } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useSocketContext } from "../../context/Socket";
import axios from "axios";
import API_URL from "../../../axios/API_URL";

interface MessageInputBarProps {
  trainerId?: string; 
  onNewMessage: (message: any) => void;
}

function MessageInputBar({ trainerId, onNewMessage }: MessageInputBarProps) {
  const [message, setMessage] = useState('');
  const { sendMessage } = useSendMessage();
  const [trainer, setTrainer] = useState('')
  const [user, setUser] = useState('')
  const { token, userInfo } = useSelector((state: RootState) => state.user);
  const { socket } = useSocketContext();
  const validToken = token ?? ""; 
  const userId = userInfo?.id
// console.log('trainer',trainer);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/trainers/${trainerId}`
        );
        setTrainer(response.data[0].name);
      } catch (error) {
        console.error("Error fetching trainer:", error);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/user/users/${userInfo?.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }, 
          }
        );

        setUser(response.data.name);
      } catch (error) {
        console.error("Error fetching trainer:", error);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!message) return;

    const receiverId = trainerId ?? "defaultTrainerId";
    
    const newMessage = {
      message,
      receiverId,
      trainerName: user,
      senderModel: "User",
      createdAt: new Date().toISOString(),
      userId: userId
    };

    if (socket) {
      socket.emit("sendMessage", newMessage); 

    } else {
      console.error("Socket is not initialized");
    }
    
    if(socket) {
      socket.emit('chatNotification', newMessage)
    }

    await sendMessage({ message, receiverId, token: validToken, senderName: user });

    onNewMessage(newMessage);
    setMessage(""); // Reset the message input
  };

  return (
    <form onSubmit={handleSendMessage} className="relative w-full">
      <input
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        type="text"
        className="border text-sm rounded-lg block w-full p-2.5 pr-10 bg-gray-700 border-gray-600 text-white"
        placeholder="Send a message"
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-white"
      >
        <BsSend />
      </button>
    </form>
  );
}

export default MessageInputBar;
