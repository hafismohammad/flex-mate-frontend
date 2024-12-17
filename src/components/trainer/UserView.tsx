import { useEffect, useState } from "react";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { useLocation } from "react-router-dom";
import TrainerChat from "./TrainerChat"; // Import TrainerChat component
import { useDispatch } from "react-redux";
import { setPrescription } from "../../features/trainer/trainerSlice";
import toast, { Toaster } from "react-hot-toast";
import { formatPriceToINR, formatTime } from "../../utils/timeAndPriceUtils";
import Loading from "../spinner/Loading";

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
  userId: string;
}

function UserView() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetail | null>( null);
  const [chatOpen, setChatOpen] = useState(false); // State to track if chat is open
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>( null);
  const [prescriptionInfo, setPrescriptionInfo] = useState<string | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrescription, setNewprescription] = useState<string | null>(null);
  const [edtiOption, setEdtiOption] = useState(false);
  

  const { trainerInfo, showPrescription } = useSelector(
    (state: RootState) => state.trainer
  );
  

  const location = useLocation();
  const bookingId = location.state?.bookingId;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await axiosInstance.get(
          `api/trainer/booking/${bookingId}`
        );
        setBookingDetails(response.data[0]); // Assuming response contains an array
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };
    if (bookingId) {
      fetchUserBookings();
    }
  }, [bookingId]);

  const openChat = (userId: string, bookingId: string) => {
    setSelectedUserId(userId);
    setSelectedBookingId(bookingId);
    setChatOpen(true); // Set chat as open
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

  const handleView = (bookingDetails: BookingDetail) => {

    setPrescriptionData(bookingDetails);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEdtiOption(false);
  };

  const handleEdit = () => {
    setEdtiOption(true);
  };

  const handleSave = async (bookingId: string | undefined) => {
    if (!newPrescription) {
      toast.error("Prescription cannot be empty.");
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/api/trainer/update-prescription/${bookingId}`,
        { data: newPrescription }
      );
      if (response.status === 200) {
        setBookingDetails((prev) =>
          prev
            ? {
                ...prev,
                prescription: newPrescription,
              }
            : null
        );
        toast.success(
          response.data.message || "Prescription updated successfully"
        );
      }
    } catch (error: any) {
      console.error("Error updating prescription:", error);
      const errorMessage =
      error.response?.data?.message || "Failed to update the prescription. Please try again.";

    toast.error(errorMessage);
    } finally {
      handleClose();
    }
  };

  if (chatOpen && selectedUserId && selectedBookingId) {
    return (
      <div>
        <div className="flex justify-center items-center w-full h-full p-4">
          <div className="w-full max-w-4xl bg-white shadow-lg rounded-md overflow-hidden h-[80vh]">
            <TrainerChat
              userId={selectedUserId}
              bookingId={selectedBookingId}
            />
          </div>
        </div>

        <div>
          <Toaster />
          {showPrescription && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 w-[800px] shadow-lg">
                <h1 className="font-bold text-xl text-center mb-6">
                  Send Prescription
                </h1>
                {bookingDetails ? (
                  <>
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                          <img
                            src={
                              bookingDetails.userImage ||
                              "/placeholder-image.jpg"
                            }
                            alt="User profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-gray-800">
                          <p>
                            <strong>Name:</strong>{" "}
                            {bookingDetails.userName || "N/A"}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {bookingDetails.userMail || "N/A"}
                          </p>
                          <p>
                            <strong>Specialization:</strong>{" "}
                            {bookingDetails.specialization.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <label
                        htmlFor="prescription-input"
                        className="block font-medium text-gray-700 mb-2"
                      >
                        Enter Prescription
                      </label>
                      <textarea
                        onChange={(e) => setPrescriptionInfo(e.target.value)}
                        id="prescription-input"
                        className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write the prescription here..."
                        rows={10}
                      />
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
                ) : (
                  <p className="text-center text-gray-600">
                    No booking details available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="user-view-container p-6 bg-gray-50 ">
        {bookingDetails ? (
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <img
                src={bookingDetails.userImage || "/placeholder-image.jpg"}
                alt={bookingDetails.userName}
                className="w-20 h-20 rounded-full border border-gray-200 object-cover mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {bookingDetails.userName}
                </h3>
                <p className="text-sm text-gray-500">
                  {bookingDetails.userMail}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Session Type:</span>
                <span className="text-gray-800">
                  {bookingDetails.sessionType}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Specialization:
                </span>
                <span className="text-gray-800">
                  {bookingDetails.specialization.name}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Session Date:</span>
                <span className="text-gray-800">
                  {new Date(
                    bookingDetails.sessionDates.startDate
                  ).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Session Time:</span>
                <span className="text-gray-800">
                  {formatTime(bookingDetails.sessionStartTime)} -{" "}
                  {formatTime(bookingDetails.sessionEndTime)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Amount:</span>
                <span className="text-gray-800 font-semibold">
                  {formatPriceToINR(bookingDetails.amount.toFixed(2))}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Payment Status:
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    bookingDetails.paymentStatus.toLowerCase() === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : bookingDetails.paymentStatus.toLowerCase() ===
                        "completed"
                      ? "bg-blue-100 text-blue-700"
                      : bookingDetails.paymentStatus.toLowerCase() ===
                        "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {bookingDetails.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                {bookingDetails.paymentStatus === "Completed" && (
                  <span className="text-gray-600 font-medium">
                    Prescription:
                  </span>
                )}
                <span className="text-gray-800 font-semibold">
                  {bookingDetails.paymentStatus === "Completed" && (
                    <div onClick={() => handleView(bookingDetails)}>
                      <span className=" font-bold text-blue-700 px-7 py-1 rounded-lg">
                        View
                      </span>
                    </div>
                  )}
                </span>
              </div>
            </div>

            <button
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() =>
                openChat(bookingDetails.userId, bookingDetails._id)
              }
            >
              Open Chat
            </button>
          </div>
        ) : (
          <Loading />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] shadow-lg">
            <h1 className="text-xl font-bold text-center mb-6">Prescription</h1>
            <div className="p-4 bg-gray-100 shadow-md rounded-lg">
              <div>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={prescriptionData?.userImage}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p>
                    <strong>Name:</strong> {prescriptionData?.userName}
                  </p>
                  <p>
                    <strong>Email</strong> {prescriptionData?.userMail}
                  </p>
                  <p>
                    <strong>Specializtion</strong>{" "}
                    {prescriptionData?.specialization.name}
                  </p>
                </div>
                <div className="mt-4">
                  <label className="block font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  {edtiOption ? (
                    <textarea
                      onChange={(e) => setNewprescription(e.target.value)}
                      //  id={`prescription-${index}`}
                      //  value={prescriptionData?.prescription || ""}
                      value={newPrescription || ""}
                      className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write the prescription here..."
                      rows={10}
                    />
                  ) : (
                    <p>
                      {prescriptionData?.prescription ||
                        "No prescription provided."}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 text-end">
              <button
                onClick={handleClose}
                className="bg-red-500 mr-5 hover:bg-red-700 font-bold text-white py-2 px-6 rounded-lg"
              >
                Close
              </button>
              {edtiOption ? (
                <button
                  onClick={() => handleSave(prescriptionData?._id)}
                  className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-2 px-6 rounded-lg"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-2 px-6 rounded-lg"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserView;
