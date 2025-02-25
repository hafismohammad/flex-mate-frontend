import React, { useEffect, useRef } from 'react';
import { formatTime } from '../../utils/timeAndPriceUtils';
import 'daisyui/dist/styled.css';  // Move import to the top

interface MessageProps {
  message: string;
  sender: 'User' | 'Trainer';
  time: string;
  userImage: string | undefined;
  trainerImage: string | undefined;
}

function Message({ sender, message, time, userImage, trainerImage }: MessageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const isTrainer = sender.toLowerCase() === 'trainer';
  const chatBubbleClass = `chat-bubble text-white ${isTrainer ? 'bg-blue-500' : 'bg-gray-500'}`;


  return (
    <div className={`chat ${isTrainer ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img alt="Avatar" src={isTrainer ? trainerImage : userImage} />
        </div>
      </div>

      <div className={chatBubbleClass}>
        {message}
      </div>

      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formatTime(time)}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Message;
