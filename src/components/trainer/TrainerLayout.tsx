import React, { useState, useEffect } from "react";
import TrainerSidebar from "./TrainerSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { BsBell } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { logoutTrainer } from "../../actions/trainerAction";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useNotification } from "../../context/NotificationContext ";

interface Notification {
  content: string;
  read: boolean;
  createdAt: string;
}

const TrainerLayout: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [trainerProfile, setTrainerProfile] = useState('')
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    trainerNotifications,
    addTrainerNotification,
    clearTrainerNotifications,
    updateTrainerNotificationReadStatus,
  } = useNotification();


  const { trainerInfo } = useSelector((state: RootState) => state.trainer);

  const handleLogout = () => {
    dispatch(logoutTrainer());
    clearTrainerNotifications();
    navigate("/trainer/login");
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (trainerInfo?.id) {
          const response = await axiosInstance.get(
            `/api/trainer/notifications/${trainerInfo.id}`
          );
          const serverNotifications = response.data.notifications || [];
          serverNotifications.forEach((notif: { content: string }) => {
            addTrainerNotification(notif.content);
          });
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [trainerInfo?.id]);

  const handleClear = async () => {
    try {
      const response = await axiosInstance.delete(
        `/api/trainer/clear-notifications/${trainerInfo?.id}`
      );

      if (response.status === 200) {
        clearTrainerNotifications();
        toast.success(response.data.message);
      } else {
        toast.error("Failed to clear notifications.");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("An error occurred while clearing notifications.");
    }
  };

  const handleReadUnread = (notificationId: string) => {
    updateTrainerNotificationReadStatus(notificationId);
  };

  useEffect(() => {
    const fetchTrainerData = async () => {
      const response = await axiosInstance(`api/trainer/${trainerInfo.id}`)
      setTrainerProfile(response.data.trainerData[0].profileImage)
    }
    fetchTrainerData()
  },[trainerInfo?.id])
console.log('trainerNotifications',trainerNotifications);

  return (
    <div className="flex h-screen">
      <Toaster />
      <TrainerSidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-blue-800 text-white shadow-md py-4 px-6 flex items-center justify-between">
          <div className="relative flex items-center space-x-6 ml-auto">
            <div className="relative">
              <BsBell
                className="h-6 w-6 text-white cursor-pointer"
                onClick={toggleNotificationDropdown}
              />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                {trainerNotifications.length}
              </span>

              {isNotificationOpen && (
                <div className="absolute top-10 right-0 w-96 bg-white shadow-lg rounded-md p-4 z-50">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Notifications
                  </h3>
                  {trainerNotifications.length > 0 ? (
                    <>
                      <ul className="space-y-3 mt-2 max-h-64 overflow-y-auto">
                        {trainerNotifications
                          .slice() // Create a copy to avoid mutating the state
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          ) // Sort in descending order
                          .map((notification, index) => (
                            <li
                              key={index}
                              onClick={() => handleReadUnread(notification.id)}
                              className={`text-sm text-gray-700 border-b pb-2 ${
                                notification.read
                                  ? "opacity-50 bg-gray-100"
                                  : "bg-yellow-100"
                              }`}
                            >
                              {typeof notification.message === "string"
                                ? notification.message
                                : "Invalid message"}
                            </li>
                          ))}
                      </ul>

                      <div className="flex justify-end mt-2">
                        <button onClick={handleClear} className="text-gray-800">
                          Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No new notifications
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center focus:outline-none"
                onClick={toggleProfileDropdown}
              >
                <img src={trainerProfile} className="h-10 w-10 rounded-full" alt="" />
              </button>
              {isProfileDropdownOpen && (
                <ul
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white text-gray-800 z-10"
                >
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <button
                      onClick={() => navigate("/trainer/profile")}
                      className="w-full text-left"
                    >
                      My Profile
                    </button>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 bg-blue-50 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TrainerLayout;
