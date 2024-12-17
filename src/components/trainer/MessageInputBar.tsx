import React, { useState } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useSocketContext } from "../../context/Socket";

interface MessageInputBarProps {
  userId?: string;
  onNewMessage: (message: any) => void;
}

function MessageInputBar({ userId, onNewMessage }: MessageInputBarProps) {
  const [message, setMessage] = useState("");
  const { sendMessage } = useSendMessage();
  const { trainerToken, trainerInfo } = useSelector(
    (state: RootState) => state.trainer
  );
  const { socket } = useSocketContext();

  const validToken = trainerToken ?? "";

  const handleSendMessage = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!message) return;

    const receiverId = userId ?? "defaultUserId";
    const newMessage = {
      message,
      receiverId,
      senderModel: "Trainer",
      createdAt: new Date().toISOString(),
      userId: trainerInfo.id,
    };

    if (socket) {
      socket.emit("sendMessage", newMessage);
    } else {
      console.error("Socket is not initialized");
    }

    await sendMessage({ message, receiverId, token: validToken });

    onNewMessage(newMessage);
    setMessage("");
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
