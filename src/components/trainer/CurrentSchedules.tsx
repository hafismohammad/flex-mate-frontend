// CurrentSchedules.tsx
import { FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SessionModal from "../../components/trainer/SessionModal";
import API_URL from "../../../axios/API_URL";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { ISessionSchedule, ISpec } from "../../types/trainer";
import { formatTime, calculateDuration, formatPriceToINR,} from "../../utils/timeAndPriceUtils";
import Swal from "sweetalert2";

function CurrentSchedules() {
  const [modalOpen, setModalOpen] = useState(false);

  // Add necessary state variables
  const [isSingleSession, setIsSingleSession] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [specModal, setSpecModal] = useState(false);
  const [specId, setSpecId] = useState<string | null>(null);
  const [spec, setSpec] = useState<ISpec[]>([]);
  const [recurrenceOption, setRecurrenceOption] = useState("oneDay");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [sessionSchedules, setSessionSchedules] = useState<ISessionSchedule[]>([]);

  const { trainerInfo } = useSelector((state: RootState) => state.trainer);
  const trainerId = trainerInfo.id;

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 20);
    const clearSessionData = () => {
      setSelectedDate(null);
      setStartDate(null);
      setEndDate(null);
      setStartTime("");
      setEndTime("");
      setPrice("");
    };

    if (isSingleSession) {
      if (!selectedDate || !startTime || !price) {
        toast.error("Please fill in all fields for the single session.");
        return;
      }
      if (new Date(selectedDate) > maxDate) {
        toast.error("The session date must be within the next 20 days.");
        return;
      }
    } else {
      if (!startDate || !endDate || !startTime || !endTime || !price) {
        toast.error("Please fill in all fields for the package session.");
        return;
      }
      if (startTime >= endTime) {
        toast.error("End time must be after start time");
        return;
      }
      if (new Date(startDate) > maxDate) {
        toast.error("The package start date must be within the next 20 days.");
        return;
      }
      if (new Date(startDate) >= new Date(endDate)) {
        toast.error("Start date must be before end date.");
        return;
      }
    }

    const sessionData = isSingleSession
      ? {
          recurrenceOption,
          specId,
          isSingleSession,
          selectedDate: selectedDate?.toISOString(),
          startTime,
          endTime,
          price,
        }
      : {
          specId,
          isSingleSession,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          startTime,
          endTime,
          price,
        };

    try {
      const response = await axiosInstance.post(
        `${API_URL}/api/trainer/session/${trainerId}`,
        sessionData
      );
      const newSchedule = response.data.createdSessionData;

      setSessionSchedules((prevSchedules) =>
        Array.isArray(newSchedule)
          ? [...prevSchedules, ...newSchedule]
          : [...prevSchedules, newSchedule]
      );

      if (response.status === 201) {
        toast.success("Session created successfully");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data.message ||
          "Time conflict with an existing session.";
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        console.error("Unauthorized request. Redirecting to login.");
        window.location.href = "/trainer/login";
      } else {
        console.error("Unexpected error:", error);
        const generalErrorMessage =
          error.response?.data.message || "An unexpected error occurred";
        toast.error(generalErrorMessage);
      }
    }

    handleCloseModal();
    setModalOpen(false);
    clearSessionData();
  };

  const handleOpenModal = async () => {
    setSpecModal(true);

    const response = await axiosInstance.get(
      `/api/trainer/trainers/${trainerInfo.id}/specializations`
    );
    setSpec(response.data.specializations);
  };

  const handleSpecClick = (specId: string) => {
    setSpecId(specId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axiosInstance.get(
          `${API_URL}/api/trainer/schedules/${trainerId}`
        );
        const schedules = response.data.sheduleData;
        setSessionSchedules(schedules);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
        toast.error("Failed to fetch schedules");
      } finally {
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [trainerId]);

  const handleDelete = (sessionId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This session will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance.delete(
            `api/trainer/sessions/${sessionId}`
          );
          setSessionSchedules((schedule) =>
            schedule.filter((schedule) => schedule._id != sessionId)
          );

          return toast.success("Session deleted successfully");
        } catch (error) {
          Swal.fire("Error", "Failed to delete the session.", "error");
        }
      }
    });
  };
  const filterSession = (type: string) => {
    setFilterType(type);
  };

  const filterStatusType = (type: string) => {
    setFilterStatus(type);
  };

  const filteredSchedules = sessionSchedules.filter((schedule) => {
    if (filterType === "single" && !schedule.isSingleSession) return false;
    if (filterType === "package" && schedule.isSingleSession) return false;

    if (filterStatus === "pending" && schedule.status !== "Pending")
      return false;
    if (filterStatus === "confirmed" && schedule.status !== "Confirmed")
      return false;

    if (
      filterStartDate &&
      new Date(schedule.startDate).toISOString().split("T")[0] !==
        filterStartDate
    )
      return false;

    return true;
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Toaster />
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-gray-800">Current Schedules</h2>

        <div className="flex items-center gap-4">
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          />

          <select
            onChange={(e) => filterStatusType(e.target.value)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
          <select
            onChange={(e) => filterSession(e.target.value)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            <option value="all">All Sessions</option>
            <option value="single">Single Session</option>
            <option value="package">Package Session</option>
          </select>

          <button
            onClick={handleOpenModal}
            className="flex items-center bg-blue-500 px-3 py-2 text-white rounded-md hover:bg-blue-700"
          >
            <FaPlus className="mr-1" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* {!sessionSchedules && <Loading />} */}

      {specModal && (
   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
   <div className="bg-white rounded-lg p-6 h-[65vh] w-full max-w-lg shadow-lg flex flex-col justify-between">
     <div>
       <h2 className="text-2xl font-semibold text-gray-800 mb-4">
         Select Specialization
       </h2>
 
       <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
         {spec.map((specialization) => (
           <button
             key={specialization._id}
             onClick={() => handleSpecClick(specialization._id)} 
             className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg shadow-sm text-left"
           >
             {specialization.name}
           </button>
         ))}
       </div>
     </div>
 
     <div className="flex justify-end mt-4">
       <button
         onClick={() => setSpecModal(false)}
         className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
       >
         Close
       </button>
     </div>
   </div>
 </div>
 
      )}

      <SessionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        isSingleSession={isSingleSession}
        setIsSingleSession={setIsSingleSession}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        price={price}
        setPrice={setPrice}
        handleAdd={handleAdd}
        setRecurrenceOption={setRecurrenceOption}
      />

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-9 gap-1 text-lg font-bold text-gray-600 mb-4 border-b border-gray-200 pb-2">
          <div>Session Type</div>
          <div>Name</div>
          <div>Date</div>
          <div>Start Time</div>
          <div>End Time</div>
          <div>Price</div>
          <div>Duration</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule._id}
              className="grid grid-cols-9 gap-1 items-center p-2 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-none mb-2"
            >
              <div className="text-gray-800 font-medium">
                {schedule.isSingleSession ? "Single Session" : "Package"}
              </div>
              <div className="text-gray-800 font-medium">
                {schedule.specializationId.name}
              </div>
              <div className="text-gray-800 font-medium mt-3">
                {schedule.isSingleSession
                  ? new Date(schedule.startDate).toLocaleDateString()
                  : `${new Date(
                      schedule.startDate
                    ).toLocaleDateString()} / ${new Date(
                      schedule.endDate
                    ).toLocaleDateString()}`}
              </div>
              <div className="text-gray-800 font-medium">
                {formatTime(schedule.startTime)}
              </div>
              <div className="text-gray-800 font-medium">
                {formatTime(schedule.endTime)}
              </div>
              <div className="text-gray-800 font-medium">
                {formatPriceToINR(schedule.price)}
              </div>
              <div className="text-gray-800 font-medium">
                {calculateDuration(schedule.startTime, schedule.endTime)}
              </div>
              <div
                className={`font-medium ${
                  {
                    Pending: "text-yellow-500",
                    Confirmed: "text-green-500",
                    Completed: "text-blue-500",
                    Cancelled: "text-red-500",
                    InProgress: "text-purple-500",
                  }[schedule.status] || "text-gray-800"
                }`}
              >
                {schedule.status}
              </div>
              <button
                onClick={() => handleDelete(schedule._id)}
                className="bg-red-500 px-2 py-2 rounded-lg text-white hover:bg-red-600 shadow-md"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="flex justify-center">
            <h1 className="font-medium ">No Session Schedules</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentSchedules;
