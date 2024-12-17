import 'daisyui/dist/styled.css'
import { useEffect, useRef } from 'react';
import { formatTime } from '../../utils/timeAndPriceUtils';

interface MessageProps {
  message: string;
  sender: 'User' | 'Trainer';
  time: string;
  userImage: string | undefined
  trainerImage: string | undefined
}

function Message({ sender, message, time, userImage, trainerImage, }: MessageProps)  {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    import('daisyui/dist/styled.css');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={`chat ${sender === 'User' ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img alt="Avatar" src={ sender === 'User'? userImage : trainerImage} />
        </div>
      </div>
      <div className={`chat-bubble text-white ${sender === 'User' ? 'bg-blue-500' : 'bg-gray-500'}`}>
        {message}
      </div>
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formatTime(time)}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Message