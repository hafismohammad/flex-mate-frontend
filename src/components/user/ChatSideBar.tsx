import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useSocketContext } from "../../context/Socket";
import userAxiosInstance from "../../../axios/userAxionInstance";
import UserChat from "./UserChat";
import axios from "axios";
import { IVideoCallUser } from "../../types/common";
import API_URL from "../../../axios/API_URL";

interface Trainer {
  trainerId: string;
  trainerName: string;
  trainerImage: string;
  hasNewMessage: boolean;
  messageCount: number;
}

function ChatSideBar() {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const userId = userInfo?.id;
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null );
  const [callHistory, setCallHistory] = useState<IVideoCallUser[]>([]);
  const [isHistory, setIsHistory] = useState(false);
  const { socket } = useSocketContext();
  const loadMessageCounts = () => {
    const savedCounts = localStorage.getItem("messageCounts");
    return savedCounts ? JSON.parse(savedCounts) : {};
  };
  
  const saveMessageCounts = (counts: Record<string, number>) => {
    localStorage.setItem("messageCounts", JSON.stringify(counts));
  };

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/messages/call-history-user/${userId}`
        );
        setCallHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching call history:", error);
      }
    };
    fetchCallHistory();
  }, [userId]);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await userAxiosInstance.get(
          `/api/user/bookings-details/${userId}`
        );
        const seenTrainerIds = new Set();
        const uniqueTrainers = response.data.filter((booking: any) => {
          if (seenTrainerIds.has(booking.trainerId)) {
            return false;
          }
          seenTrainerIds.add(booking.trainerId);
          return true;
        });

        const messageCounts = loadMessageCounts();

        setTrainers(
          uniqueTrainers.map((booking: any) => ({
            trainerId: booking.trainerId,
            trainerName: booking.trainerName,
            trainerImage: booking.trainerImage || "/default-avatar.png",
            hasNewMessage: !!messageCounts[booking.trainerId],
            messageCount: messageCounts[booking.trainerId] || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };

    fetchTrainers();
  }, [userId]);

  useEffect(() => {
    const handleNewMessage = (data: { userId: string; receiverId: string }) => {
      
      if (data.receiverId !== userId) return;
  
      setTrainers((prevTrainers) => {
        const updatedTrainers = [...prevTrainers];
        const messageCounts = loadMessageCounts();
  
        const index = updatedTrainers.findIndex(
          (trainer) => trainer.trainerId === data.userId
        );
  
        if (index > -1) {
          const trainerId = updatedTrainers[index].trainerId;
  
          messageCounts[trainerId] = (messageCounts[trainerId] || 0) + 1;
          saveMessageCounts(messageCounts);
  
          updatedTrainers[index] = {
            ...updatedTrainers[index],
            hasNewMessage: true,
            messageCount: messageCounts[trainerId],
          };
  
          const [trainer] = updatedTrainers.splice(index, 1);
          updatedTrainers.unshift(trainer);
        }
  
        return updatedTrainers;
      });
    };
  
    socket?.on("messageUpdate", handleNewMessage);
  
    return () => {
      socket?.off("messageUpdate", handleNewMessage);
    };
  }, [socket, userId]);
  

  const handleTrainerSelect = (trainerId: string) => {
    setSelectedTrainerId(trainerId);

    // Reset new message count for the selected trainer
    setTrainers((prevTrainers) => {
      const messageCounts = loadMessageCounts();

      const updatedTrainers = prevTrainers.map((trainer) => {
        if (trainer.trainerId === trainerId) {
          messageCounts[trainerId] = 0; // Reset count
          saveMessageCounts(messageCounts);
          return { ...trainer, hasNewMessage: false, messageCount: 0 };
        }
        return trainer;
      });

      return updatedTrainers;
    });
  };

  const handleClick = (type: string) => {
    setIsHistory(type === "history");
  };

  return (
    <div className="flex">
      <div className="p-6 bg-gray-100 min-h-screen w-1/4">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleClick("chats")}
            className={`${
              !isHistory ? "bg-blue-600" : "bg-gray-400"
            } text-white p-2 rounded`}
          >
            Chats
          </button>
          <button
            onClick={() => handleClick("history")}
            className={`${
              isHistory ? "bg-blue-600" : "bg-gray-400"
            } text-white p-2 rounded`}
          >
            Call History
          </button>
        </div>
        {!isHistory ? (
          <div className="bg-white shadow-lg rounded-lg p-4 mt-4 overflow-auto">
            {trainers.length > 0 ? (
              trainers.map((trainer) => (
                <div
                  key={trainer.trainerId}
                  onClick={() => handleTrainerSelect(trainer.trainerId)}
                  className={`flex items-center justify-between mb-2 border-b border-gray-200 pb-2 cursor-pointer rounded-md ${
                    selectedTrainerId === trainer.trainerId
                      ? "bg-blue-400 text-white"
                      : "bg-blue-100 text-gray-800"
                  } transition-all`}
                >
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={trainer.trainerImage}
                      alt={`${trainer.trainerName}'s Avatar`}
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold">{trainer.trainerName}</h3>
                      {trainer.hasNewMessage && (
                        <span className="text-sm text-red-500">
                          New Message ({trainer.messageCount})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 py-8">
                <p>No trainers found to chat with.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg mt-4 max-w-[450px] max-h-[420px] overflow-y-auto shadow-lg">
            {callHistory.length > 0 ? (
              callHistory.map((call) => (
                <div className="flex">
                  <div key={call.roomId} className="flex items-center mb-4">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={call.trainerId.profileImage || "/default-avatar.png"}
                      alt={call.trainerId?.name || "User"}
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold">
                        {call.trainerId?.name || "Unknown User"}
                      </h3>
                      <h1 className="text-sm text-gray-500">{new Date(call.startedAt).toLocaleTimeString()}</h1>
                      <p className="text-sm text-gray-500">Incoming</p>

                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600">
                <p>No call history available.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-[900px] h-[600px]  overflow-auto shadow-lg">
        {selectedTrainerId ? (
          <UserChat trainerId={selectedTrainerId} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-xl">
              Select a trainer to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSideBar;
