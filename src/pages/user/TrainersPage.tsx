import React, { useRef, useState } from "react";
import TrainersList from "../../components/user/TrainersList";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import Sidebar from "../../components/user/TrainersSidebar";
import TrainersListBanner from "../../components/user/TrainersListBanner";

function TrainersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
const servicesRef = useRef<HTMLDivElement>(null);
  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col pt-14">
      <Header  scrollToServices={scrollToServices}/>

      <TrainersListBanner />

      <button
          className="fixed bottom-4 left-4 md:hidden bg-gray-800 text-white p-4 rounded-full shadow-lg z-50"
          onClick={toggleSidebar}
        >
          ☰
        </button>

      <div className="flex flex-1 bg-gray-100 relative">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div
          className={`fixed inset-y-0 left-0 z-40  bg-white transform overflow-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:hidden`}
        >
          <Sidebar />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
            onClick={toggleSidebar}
          ></div>
        )}

        <div className="flex-1 p-6">
          <TrainersList />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TrainersPage;
