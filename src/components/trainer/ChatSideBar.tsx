import axiosInstance from "../../../axios/trainerAxiosInstance";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { useSocketContext } from "../../context/Socket";
import TrainerChat from "./TrainerChat";
import axios from "axios";
import { IVideoCall } from "../../types/common";
import { useDispatch } from "react-redux";
import { setPrescription } from "../../features/trainer/trainerSlice";
import toast, { Toaster } from "react-hot-toast";

interface User {
  userId: string;
  userName: string;
  email: string;
  userImage: string;
  hasNewMessage: boolean;
  bookingId: string;
  specialization: string;
}

function ChatSideBar() {
  const { trainerInfo, showPrescription } = useSelector(
    (state: RootState) => state.trainer
  );
  const trainerId = trainerInfo.id;
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [callHistory, setCallHistory] = useState<IVideoCall[]>([]);
  const [isHistory, setIsHistory] = useState(false);
  const [prescriptionInfo, setPrescriptionInfo] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocketContext();

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/messages/call-history/${trainerId}`
        );
        setCallHistory(response.data || []);
      } catch (error) {
        console.error("Error fetching call history:", error);
      }
    };
    fetchCallHistory();
  }, [trainerId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/trainer/booking-details/${trainerId}`
        );
        const seenUserId = new Set();
        const uniqueUsers = response.data.filter((booking: any) => {
          if (seenUserId.has(booking.userId)) {
            return false;
          }
          seenUserId.add(booking.userId);
          return true;
        });
        const messageCounts = JSON.parse(
          localStorage.getItem("messageCounts") || "{}"
        );
        const savedOrder = JSON.parse(
          localStorage.getItem("usersOrder") || "[]"
        );
        const userMap = new Map(
          uniqueUsers.map((booking: any) => [
            booking.userId,
            {
              userId: booking.userId,
              userName: booking.userName,
              email: booking.userMail,
              userImage: booking.userImage,
              specialization: booking.specialization.name,
              bookingId: booking.bookingId,
              hasNewMessage: Boolean(messageCounts[booking.userId]),
            },
          ])
        );
        const reorderedUsers =
          savedOrder.length > 0
            ? savedOrder
                .map((savedUser: User) => userMap.get(savedUser.userId))
                .filter(Boolean)
            : Array.from(userMap.values());

        setUsers(reorderedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [trainerId, axiosInstance]);

  useEffect(() => {
    const handleNewMessage = (data: { userId: string }) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.userId === data.userId ? { ...user, hasNewMessage: true } : user
        );
        const userWithNewMessage = updatedUsers.find(
          (user) => user.userId === data.userId
        );
        const remainingUsers = updatedUsers.filter(
          (user) => user.userId !== data.userId
        );
        const reorderedUsers = [
          ...(userWithNewMessage ? [userWithNewMessage] : []),
          ...remainingUsers,
        ];

        const messageCounts = JSON.parse(
          localStorage.getItem("messageCounts") || "{}"
        );
        messageCounts[data.userId] = (messageCounts[data.userId] || 0) + 1;
        localStorage.setItem("messageCounts", JSON.stringify(messageCounts));
        localStorage.setItem("usersOrder", JSON.stringify(reorderedUsers));

        return reorderedUsers;
      });
    };

    socket?.on("messageUpdate", handleNewMessage);

    return () => {
      socket?.off("messageUpdate", handleNewMessage);
    };
  }, [socket]);

  const handleUserSelect = (userId: string, booking: string) => {
    setSelectedUserId(userId);
    setBookingId(booking);

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userId ? { ...user, hasNewMessage: false } : user
      )
    );

    const messageCounts = JSON.parse(
      localStorage.getItem("messageCounts") || "{}"
    );
    messageCounts[userId] = 0;
    localStorage.setItem("messageCounts", JSON.stringify(messageCounts));
  };

  const handleClick = (type: string) => {
    setIsHistory(type === "history");
  };

  const handlePrescriptionClose = () => {
    dispatch(setPrescription(false));
  };

  const handlePrescriptionSend = async () => {
    try {
      const response = await axiosInstance.post(
        `/api/trainer/prescriptions/${bookingId}`,
        { data: prescriptionInfo }
      );
      if (response.status === 200) {
        toast.success("Prescription sent successfully");
      }
      dispatch(setPrescription(false));
      setPrescriptionInfo(null);
    } catch (error) {}
  };

  return (
    <div className="flex ">
      <Toaster />
      <div className="p-6 bg-gray-100 min-h-screen w-1/4 ">
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
          <div className="bg-white shadow-lg rounded-lg p-2 mt-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.userId}
                  onClick={() => handleUserSelect(user.userId, user.bookingId)}
                  className={`flex items-center justify-between mb-2 cursor-pointer p-2 rounded-md ${
                    selectedUserId === user.userId
                      ? "bg-blue-400 text-white"
                      : "bg-blue-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.userImage || "/default-avatar.png"}
                      alt={`${user.userName}'s Avatar`}
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold">{user.userName}</h3>

                      {user.hasNewMessage && (
                        <span className="text-sm text-red-500 ml-2">
                          New Message ({" "}
                          {JSON.parse(
                            localStorage.getItem("messageCounts") || "{}"
                          )[user.userId] || 0}{" "}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 py-8">
                <p>No users found to chat with.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg mt-4 max-h-[500px] overflow-y-auto  shadow-lg">
            {callHistory.length > 0 ? (
              callHistory.map((call) => (
                <div key={call.roomId} className="flex mb-4">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={call.userId?.image || "/default-avatar.png"}
                    alt={call.userId?.name || "User"}
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold">
                      {call.userId?.name || "Unknown User"}
                    </h3>
                    <h1 className="text-sm text-gray-500">
                      {new Date(call.startedAt).toLocaleTimeString()}
                    </h1>

                    <p className="text-sm text-gray-500">Outgoing</p>
                  </div>
                  {/* <h1>{new Date(call.startedAt).toLocaleTimeString()}</h1> */}
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
      <div className="flex-1 ml-4 h-[600px] overflow-auto shadow-lg">
        {selectedUserId ? (
          <TrainerChat userId={selectedUserId} bookingId={bookingId} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-xl">
              Select a user to start chatting
            </p>
          </div>
        )}
      </div>
      {showPrescription && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white  rounded-lg p-6 w-[800px]  shadow-lg">
            <h1 className="font-bold text-xl text-center mb-6">
              Send Prescription
            </h1>

            {users.length > 0 ? (
              users
                .filter((user) => user.userId === selectedUserId)
                .map((user, index) => (
                  <>
                    <div
                      key={index}
                      className="p-4 bg-gray-100 rounded-lg shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <img
                            src={user.userImage || "/placeholder-image.jpg"}
                            alt="User profile"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        <div className="text-gray-800">
                          <p>
                            <strong>Name:</strong> {user.userName || "N/A"}
                          </p>
                          <p>
                            <strong>Email:</strong> {user.email || "N/A"}
                          </p>
                          <p>
                            <strong>Specialization:</strong>{" "}
                            {user.specialization || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`prescription-${index}`}
                          className="block font-medium text-gray-700 mb-2"
                        >
                          Enter Prescription
                        </label>
                        <textarea
                          onChange={(e) => setPrescriptionInfo(e.target.value)}
                          id={`prescription-${index}`}
                          className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Write the prescription here..."
                          rows={10}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-5 mt-4">
                      <button
                        onClick={handlePrescriptionClose}
                        className="px-5 py-2 bg-red-500 hover:bg-red-700 rounded-md shadow-md text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePrescriptionSend}
                        className="px-5 py-2 bg-blue-500 hover:bg-blue-700 rounded-md shadow-md text-white"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ))
            ) : (
              <p className="text-center text-gray-600">
                No matching user found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatSideBar;
