import React, { useEffect, useState } from "react";
import trainerAxiosInstance from "../../../axios/trainerAxiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { formatTime, formatPriceToINR } from "../../utils/timeAndPriceUtils";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Specialization {
  _id: string;
  name: string;
}
interface BookingDetail {
  _id: string;
  userName: string;
  trainerName: string;
  bookingDate: string;
  sessionType: string;
  specialization: Specialization;
  sessionDates: {
    startDate: string;
    endDate?: string;
  };
  userImage: string;
  prescription?: string;
  sessionStartTime: string;
  sessionEndTime: string;
  amount: number;
  paymentStatus: string;
  userMail: string;
}

function Bookings() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetail[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [prescriptionData, setPrescriptionData] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edtiOption, setEdtiOption] = useState(false);
  const [newPrescription, setNewprescription] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 7;

  const { trainerInfo } = useSelector((state: RootState) => state.trainer);
  const trainerId = trainerInfo.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await trainerAxiosInstance.get(
          `api/trainer/booking-details/${trainerId}`
        );
        setBookingDetails(response.data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };
    fetchBookingDetails();
  }, [trainerId]);

  const filterSession = (type: string) => {
    setFilterType(type);
  };

  const filterStatusType = (type: string) => {
    setFilterStatus(type);
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBooking = bookingDetails.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredBookings.length / bookingsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const filteredBookings = bookingDetails.filter((booking) => {
    if (filterType === "single" && booking.sessionType === "Single Session") {
      return true;
    }
    if (filterType === "package" && booking.sessionType === "Package Session") {
      return true;
    }

    if (filterStatus === "cancelled" && booking.paymentStatus !== "Cancelled") {
      return false;
    }
    if (filterStatus === "confirmed" && booking.paymentStatus !== "Confirmed") {
      return false;
    }
    if (filterStatus === "completed" && booking.paymentStatus !== "Completed") {
      return false;
    }

    if (
      filterStartDate &&
      new Date(booking.bookingDate).toISOString().split("T")[0] !==
        filterStartDate
    ) {
      return false;
    }

    return true;
  });

  const handleView = (booking: BookingDetail) => {
    setPrescriptionData(booking);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setEdtiOption(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEdtiOption(false);
  };

  const handleSave = async (bookingId: string | undefined) => {
    try {
      const response = await axiosInstance.patch(
        `/api/trainer/update-prescription/${bookingId}`,
        { data: newPrescription }
      );
      if (response.status === 200) {
        setBookingDetails((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, prescription: newPrescription || "" }
              : booking
          )
        );
        if (response.data.message === "Prescription updated successfully") {
          toast.success(response.data.message);
        }
      }
    } catch (error) {
      toast.error("Failed to update the prescription. Please try again.");
      console.error("Error updating prescription:", error);
    } finally {
      handleClose();
    }
  };

  const setisOpenView = (bookingId: string) => {
    navigate("/trainer/user-view", { state: { bookingId } });
  };

  useEffect(() => {
    if (isModalOpen && prescriptionData?.prescription != null) {
      setNewprescription(prescriptionData.prescription);
    }
  }, [isModalOpen, prescriptionData]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Toaster />
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-gray-800">Bookings</h2>

        <div className="flex items-center gap-4">
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          />

          <select
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onChange={(e) => filterStatusType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="cancelled">Cancelled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>

          <select
            onChange={(e) => filterSession(e.target.value)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            <option value="all">All</option>
            <option value="single">Single Session</option>
            <option value="package">Package Session</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-lg p-6 overflow-x-auto">
        <div className="grid grid-cols-11 gap-4 text-lg font-bold text-gray-600 mb-4 border-b border-gray-200 pb-2">
          <div className="text-center">Booking ID</div>
          <div className="text-center">User Name</div>
          <div className="text-center">Date</div>
          <div className="text-center">Session</div>
          <div className="text-center">Specialization</div>
          <div className="text-center">Date(s)</div>
          <div className="text-center">Start Time</div>
          <div className="text-center">End Time</div>
          <div className="text-center">Amount</div>
          <div className="text-center">Status</div>
          <div className="text-center">View</div>
          {/* <div className="text-center">Action</div> */}
        </div>

        {currentBooking.length > 0 ? (
          currentBooking.map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-11 gap-4 items-center p-2 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-none"
            >
              <div className="text-center text-gray-800 font-medium">
                {booking._id.substring(0, 8).toUpperCase()}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {booking.userName}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {new Date(booking.bookingDate).toLocaleDateString()}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {booking.sessionType}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {booking.specialization.name}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {new Date(booking.sessionDates.startDate).toLocaleDateString()}
                {booking.sessionDates.endDate &&
                  ` - ${new Date(
                    booking.sessionDates.endDate
                  ).toLocaleDateString()}`}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {formatTime(booking.sessionStartTime)}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {formatTime(booking.sessionEndTime)}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {formatPriceToINR(booking.amount)}
              </div>
              <div
                className={`text-sm px-2 py-1 rounded-full font-medium ${
                  booking.paymentStatus.toLowerCase() === "cancelled"
                    ? "text-red-500 bg-red-100"
                    : booking.paymentStatus.toLowerCase() === "confirmed"
                    ? "text-green-500 bg-green-100"
                    : booking.paymentStatus.toLowerCase() === "completed"
                    ? "text-blue-500  bg-blue-100"
                    : "text-gray-500 bg-gray-100"
                }`}
              >
                {booking.paymentStatus}
              </div>

              <div className="ml-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 font-bold text-white px-7 py-1 rounded-lg"
                  onClick={() => setisOpenView(booking._id)}
                >
                  view
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-600 text-center mt-4">
            No bookings found.
          </div>
        )}
      </div>

      <div className="flex justify-center ml-32 mt-4 w-[75%]">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700">
          Page {currentPage} of{" "}
          {Math.ceil(bookingDetails.length / bookingsPerPage)}
        </span>
        <button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(bookingDetails.length / bookingsPerPage)
          }
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Bookings;
