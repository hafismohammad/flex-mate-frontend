import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import LOGO from "../../assets/LOGO-2.png";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import ProfileIcon from "../../assets/profile-icon.png";
import { logoutUser } from "../../actions/userAction";
import userAxiosInstance from "../../../axios/userAxionInstance";
import { BsBell } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { useNotification } from "../../context/NotificationContext ";

interface INotificationContent {
  content: string;
  bookingId: string;
  read: boolean;
}

export interface INotification {
  _id?: string;
  receiverId?: string;
  notifications?: INotificationContent[];
  createdAt?: string;
  updatedAt?: string;
}
interface HeaderProps {
  scrollToServices: () => void; 
}

function Header({ scrollToServices }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const { userInfo, token } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {addUserNotification,clearUserNotifications, userNotifications, updateUserNotificationReadStatus, countUnreadNotificationsUser} = useNotification();

  // Logout handler
  const handleLogout = () => {
    console.log("Clearing notifications... in handleLogout");
    dispatch(logoutUser());
    clearUserNotifications();
    navigate("/login");
  };

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchUserDetails = async () => {
      try {
        const response = await userAxiosInstance.get(
          `/api/user/users/${userInfo?.id}`
        );
        setImage(response.data.image);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };
    fetchUserDetails();
  }, [userInfo?.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await userAxiosInstance.get(
          `/api/user/notifications/${userInfo?.id}`
        );
        const serverNotifications = response.data?.notifications ?? [];
        serverNotifications.forEach((notif: any) => {
          if (notif && notif.content) {
            addUserNotification(notif.content);
          }
        });
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [userInfo?.id]);

  const handleClear = async () => {
    try {
      const response = await userAxiosInstance.delete(
        `/api/user/clear-notifications/${userInfo?.id}`
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        clearUserNotifications();
      } else {
        console.error("Failed to clear notifications. Please try again.");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleReadUnread = (notificationId: string) => {
    updateUserNotificationReadStatus(notificationId);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-blue-800 text-white p-4 shadow-xl">
      <Toaster />
      <div>
        <Link to="/">
          <img src={LOGO} alt="Logo" className="w-max h-7" />
        </Link>
      </div>

      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <nav
        className={`${
          isOpen ? "block" : "hidden"
        } md:flex md:space-x-8 absolute md:static bg-gray-800 md:bg-transparent w-full md:w-auto top-14 md:top-auto left-0 md:left-auto shadow-lg md:shadow-none`}
      >
        <ul className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 p-4 md:p-0">
          <li>
            <Link
              to="/"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/aboutUs"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/trainers"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Trainers
            </Link>
          </li>
          <li>
            <button
              onClick={scrollToServices}
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Services
            </button>
          </li>
          <li className="block md:hidden">
            <Link
              to="/login"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>

      <div className="relative hidden md:block">
        {token ? (
          <div className="flex items-center space-x-6">
            <div className="relative">
              <BsBell
                className="h-6 w-6 text-white cursor-pointer"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                {/* { userNotifications?.length} */}
                {countUnreadNotificationsUser}
              </span>
            </div>

            {isNotificationOpen && (
              <div className="absolute top-10 right-0 w-[340px] bg-white shadow-lg rounded-md p-4 z-40">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Notifications
                </h3>
                {userNotifications?.length > 0 ? (
                  <>
                    <ul className="space-y-3 mt-2 max-h-64 overflow-y-auto">
                      {userNotifications
                        .slice() 
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        ) 
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
                    <div onClick={handleClear} className="flex justify-end">
                      <button className="text-gray-800">Clear</button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No new notifications</p>
                )}
              </div>
            )}

            <div className="relative">
              <img
                alt="user profile"
                src={image || ProfileIcon}
                className="h-10 w-10 cursor-pointer rounded-full object-cover"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              />
              {isProfileMenuOpen && (
                <ul
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white text-gray-800"
                >
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link to="/profile">My Profile</Link>
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
        ) : (
          <Link
            to="/login"
            className="bg-white hover:bg-slate-200 text-blue-800 px-4 py-2 rounded"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
