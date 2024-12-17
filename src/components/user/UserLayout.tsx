import React, { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import UserProfileSideBar from "./UserProfileSideBar";
import Header from "./Header";

function UserLayout() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-blue-50">
      <div className="hidden lg:block w-[250px] ml-6 h-[80vh] bg-white shadow-lg">
        <UserProfileSideBar />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50  bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "250px" }}
      >
        <UserProfileSideBar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      <button
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-full shadow-lg z-50 md:hidden"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header scrollToServices={scrollToServices} />
        <div className="flex-1 pt-16 p-4 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;
