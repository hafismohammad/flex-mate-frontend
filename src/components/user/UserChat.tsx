import React, { useEffect, useState } from "react";
import Message from "./Message";
import MessageInputBar from "./MessageInputBar";
import useGetMessage from "../../hooks/useGetMessage";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { io, Socket } from "socket.io-client";
import { useSocketContext } from "../../context/Socket";
import axios from "axios";
import API_URL from "../../../axios/API_URL";
import userAxiosInstance from "../../../axios/userAxionInstance";
import { User } from "../../types/user";
import MessageSkeleton from "../skeleton/MessageSkeleton";

interface TrainerChatProps {
  trainerId: string;
}

function UserChat({ trainerId }: TrainerChatProps) {
  const [trainerData, setTrainerData] = useState<{
    name: string;
    profileImage: string;
  } | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const { token, userInfo } = useSelector((state: RootState) => state.user);
  const { messages, loading, messageRef } = useGetMessage(token!, trainerId!);
  const [localMessages, setLocalMessages] = useState(messages);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  // console.log('localMessages',localMessages);

  const { trainerInfo } = useSelector((state: RootState) => state.trainer);
  let { socket } = useSocketContext();

  useEffect(() => {
    if (messages) {
      console.log("ref ident", messageRef.current);
      console.log(messages.length && `second render ${messages}`);
      console.log("local messages ident : chat = >", localMessages);
      setLocalMessages(messages);
    } else {
      console.log("component intial");
    }
  }, [messages]);
  console.log("mesage update" + localMessages);

  useEffect(() => {
    const fetchTrainerData = async () => {
      const response = await axios(
        `${import.meta.env.VITE_BASE_URL}/api/user/trainers/${trainerId}`
      );
      setTrainerData(response.data[0]);
    };
    fetchTrainerData();
  }, [socket, trainerId]);

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchUserData = async () => {
      const response = await userAxiosInstance(
        `/api/user/users/${userInfo.id}`
      );
      setUserData(response.data);
    };
    fetchUserData();
  }, [socket, userInfo?.id]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join", trainerInfo?.id || userInfo?.id);

    const handleUpdateOnlineUsers = (users: string[]) => {
      console.log("Updated Online Users:", users);
      setOnlineUsers(users);
    };

    socket.on("updateOnlineUsers", handleUpdateOnlineUsers);

    // const handleNewMessage = (newMessage: any) => {
    //   if (newMessage.senderId === trainerId || newMessage.receiverId === trainerId) {
    //     setLocalMessages((prevMessages) => {
    //       const isDuplicate = prevMessages.some(
    //         (msg) => msg._id === newMessage._id
    //       );
    //       return isDuplicate ? prevMessages : [...prevMessages, newMessage];
    //     });
    //   }
    // };

    const handleNewMessage = (newMessage: any) => {
      setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
    };
    socket.on("messageUpdate", handleNewMessage);

    return () => {
      socket.off("messageUpdate", handleNewMessage);
      socket.off("updateOnlineUsers");
    };
  }, [socket, trainerInfo?.id, userInfo?.id]);

  const handleNewMessage = (newMessage: any) => {
    setLocalMessages((prevMessages) => {
      const isDuplicate = prevMessages.some(
        (msg) =>
          msg._id === newMessage._id ||
          (msg.createdAt === newMessage.createdAt &&
            msg.message === newMessage.message)
      );
      return isDuplicate ? prevMessages : [...prevMessages, newMessage];
    });
  };

  return (
    <div className="w-full lg:max-w-full md:max-w-[450px] h-[82vh] flex flex-col ">
      <div className="bg-gray-500 px-4 py-2 mb-2 h-14 flex justify-between sticky top-0 z-10 ">
        <div className="flex items-start gap-5 ">
          <img
            className="h-10 w-10 rounded-full "
            src={trainerData?.profileImage}
            alt="profile"
          />
          <div className="flex justify-center gap-2">
            <h1 className="text-lg font-medium text-white">
              {trainerData?.name}
            </h1>
            {onlineUsers.includes(trainerId) ? (
              <span className="text-green-500 text-sm">🟢 Online</span>
            ) : (
              <span className="text-gray-400 text-sm">⚪ Offline</span>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 flex-1 overflow-y-auto mt-2 overflow-x-hidden ">
        {loading ? (
          <div>
            <MessageSkeleton />
          </div>
        ) : (
          localMessages.length &&
          localMessages.map((msg, index) => (
            <Message
              key={index}
              sender={
                (msg.senderModel.charAt(0).toUpperCase() +
                  msg.senderModel.slice(1)) as "User" | "Trainer"
              }
              message={msg.message}
              time={new Date(msg.createdAt).toLocaleTimeString()}
              userImage={userData?.image}
              trainerImage={trainerData?.profileImage}
            />
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800 sticky bottom-0 z-10">
        <MessageInputBar
          trainerId={trainerId}
          onNewMessage={handleNewMessage}
        />
      </div>
    </div>
  );
}

export default UserChat;
