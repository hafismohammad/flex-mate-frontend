import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import LOGO from "../../assets/LOGO-2.png";
import { useDispatch } from "react-redux";
import { logoutTrainer } from "../../actions/trainerAction";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaAddressBook } from "react-icons/fa6";
import {FaBars, FaListAlt, FaTimes, FaChartPie, FaUser, FaSignOutAlt, FaWallet} from "react-icons/fa";
import { AppDispatch } from "../../app/store";
import { useSocketContext } from "../../context/Socket";
import { useNotification } from "../../context/NotificationContext ";

function TrainerSidebar() {
  const { socket } = useSocketContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [hasMessage, setHasMessage] = useState(false);
  const {clearTrainerNotifications} = useNotification()
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    clearTrainerNotifications()
    dispatch(logoutTrainer());
    
    navigate('/trainer/login'); 
  };

  useEffect(() => {
    socket?.on('messageUpdate', (data) => {
      if (data) {
        setHasMessage(true);
      }
    });
  }, [socket]);

  const handleClick = () => {
    setHasMessage(false);
  };

  const isActive = (path: string) => location.pathname === path; // Check active route

  return (
    <div className={`h-screen bg-blue-800 text-white flex flex-col p-4 shadow-md transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"} sticky top-0`}>
      <button
        onClick={toggleSidebar}
        className="text-white focus:outline-none mb-4 flex justify-end"
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {isSidebarOpen && (
        <div className="flex items-center justify-center mb-6">
          <img className="w-[70%] h-[100%]" src={LOGO} alt="Logo" />
        </div>
      )}

      <nav className="flex flex-col space-y-4">
        <Link
          to="/trainer"
          className={`flex items-center p-2 rounded-md transition ${
            isActive("/trainer") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FaChartPie size={20} />
          <span className={`ml-2 ${!isSidebarOpen && "hidden"}`}>
            Dashboard
          </span>
        </Link>

        <Link
          to="/trainer/currentSchedules"
          className={`flex items-center p-2 rounded-md transition ${
            isActive("/trainer/currentSchedules") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FaListAlt size={20} />
          <span className={`ml-2 ${!isSidebarOpen && "hidden"}`}>
            Current Schedules
          </span>
        </Link>

        <Link
          to="/trainer/bookings"
          className={`flex items-center p-2 rounded-md transition ${
            isActive("/trainer/bookings") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FaAddressBook size={20} />
          <span className={`ml-2 ${!isSidebarOpen && "hidden"}`}>
            Bookings
          </span>
        </Link>

        <Link
          to="/trainer/chat-sidebar"
          className={`flex items-center p-2 rounded-md transition ${
            isActive("/trainer/chat-sidebar") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <IoChatbubbleEllipsesSharp size={20} />
          <span onClick={handleClick} className={`ml-2 mr-2 ${!isSidebarOpen && "hidden"}`}>
            Message
          </span>
        </Link>
        
        <Link
          to="/trainer/profile"
          className={`flex items-center p-2 rounded-md transition ${
            isActive("/trainer/profile") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FaUser size={20} />
          <span className={`ml-2 ${!isSidebarOpen && "hidden"}`}>Profile</span>
        </Link>

        <Link
          to="/trainer/wallet"
          className={`flex items-center p-2 rounded-md transition ${
            isActive("/trainer/wallet") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FaWallet size={20} />
          <span className={`ml-2 ${!isSidebarOpen && "hidden"}`}>Wallet</span>
        </Link>

        <a
          href="#"
          onClick={handleLogout}
          className={`flex items-center p-2 rounded-md transition ${
            isActive("#") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FaSignOutAlt size={20} />
          <span className={`ml-2 ${!isSidebarOpen && "hidden"}`}>
            Logout
          </span>
        </a>
      </nav>
    </div>
  );
}

export default TrainerSidebar;
