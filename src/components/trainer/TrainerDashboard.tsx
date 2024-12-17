import user from "../../assets/user.png";
import rupee from "../../assets/rupee-sign.png";
import booking from "../../assets/booking (1).png";
import { useEffect, useState } from "react";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { formatPriceToINR, formatTime } from "../../utils/timeAndPriceUtils";
import { IWallet } from "../../types/trainer";

interface Specialization {
  name: string;
  _id: string;
}

interface BookingDetail {
  userName: string;
  _id: string;
  sessionDates: {
    startDate: string;
    endDate?: string;
  };
  sessionStartTime: string;
  sessionEndTime: string;
  specialization: Specialization;
  sessionType: string;
  userId: string;
  paymentStatus: string;
  sessionStatus?: string;
}

function TrainerDashboard() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetail[]>([]);
  const [walletBalcance, setWalletBalance] = useState<IWallet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 7;

  const { trainerInfo } = useSelector((state: RootState) => state.trainer);

  useEffect(() => {
    const fetchBookings = async () => {
      const response = await axiosInstance.get(
        `/api/trainer/booking-details/${trainerInfo.id}`
      );
      setBookingDetails(response.data);
    };
    fetchBookings();
  }, [trainerInfo.id]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const response = await axiosInstance.get(
        `/api/trainer/wallet-data/${trainerInfo.id}`
      );
      setWalletBalance(response.data);
    };
    fetchWalletBalance();
  }, []);

  const totalSessions = bookingDetails.length;
  const totalUsers = new Set(bookingDetails.map((booking) => booking.userId))
    .size;

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBooking = bookingDetails.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(bookingDetails.length / bookingsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* <Toaster /> */}
      <div className="flex justify-center gap-32">
        <div className="bg-blue-100 h-[100px] w-[260px] shadow-md flex items-center px-4">
          <img className="h-16 w-16 mr-4" src={booking} alt="" />
          <div>
            <h1 className="font-medium">Total Bookings</h1>
            <div className="text-lg font-bold">{totalSessions}</div>
          </div>
        </div>

        <div className="bg-blue-100 h-[100px] w-[260px] shadow-md flex items-center px-4">
          <img className="h-16 w-16 mr-4" src={user} alt="" />
          <div>
            <h1 className="font-medium">Total Clients</h1>
            <div className="text-lg font-bold">{totalUsers}</div>
          </div>
        </div>

        <div className="bg-blue-100 h-[100px] w-[260px] shadow-md flex items-center px-4">
          <img className="h-16 w-16 mr-4" src={rupee} alt="" />
          <div>
            <h1 className="font-medium">Current Earnings</h1>
            <div className="text-lg font-bold">
              {formatPriceToINR(walletBalcance?.balance ?? 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Sessions</h1>
      </div>
      <div className="mt-10 bg-white shadow-md p-3">
        <div className="grid grid-cols-6 gap-4 text-center text-lg font-bold border-b border-gray-200 pb-2">
          <div>User Name</div>
          <div>Date</div>
          <div>Time</div>
          <div>Session Type</div>
          <div>Specialization</div>
          <div>Status</div>
          {/* <div>Action</div> */}
        </div>

        {currentBooking.length > 0 ? (
          currentBooking.map((booking) => (
            <div
              key={booking._id}
              className={`grid grid-cols-6 gap-4 items-center p-2 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-none`}
            >
              <div className="text-center text-gray-800 font-medium">
                {booking.userName}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {new Date(booking.sessionDates.startDate).toLocaleDateString()}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {formatTime(booking.sessionStartTime)} -{" "}
                {formatTime(booking.sessionEndTime)}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {booking.sessionType || "N/A"}
              </div>
              <div className="text-center text-gray-800 font-medium">
                {booking.specialization.name || "N/A"}
              </div>
              <div
                className={`text-center font-medium px-2 py-1 rounded-full ${
                  booking.paymentStatus === "Cancelled"
                    ? "text-red-500 bg-red-100"
                    : booking.paymentStatus === "Confirmed"
                    ? "text-green-500 bg-green-100"
                    : booking.paymentStatus === "Completed"
                    ? "text-blue-500 bg-blue-100"
                    : "text-gray-500 bg-gray-100"
                }`}
              >
                {booking.paymentStatus}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-4">
            No upcoming sessions
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

export default TrainerDashboard;
