import { useNavigate, useParams } from "react-router-dom";
import profileBG from "../../assets/trainer-profile-view-img.jpg";
import React, { useEffect, useRef, useState } from "react";
import { TrainerProfile } from "../../types/trainer";
import LOGO from "../../assets/LOGO-2.png";
import DatePicker from "react-datepicker";
import { AvgRatingAndReviews, ISessionSchedule } from "../../types/common";
import { formatPriceToINR, numberOfSessions, calculateDuration, formatTime, } from "../../utils/timeAndPriceUtils";
import { AiOutlineClose } from "react-icons/ai";
import userAxiosInstance from "../../../axios/userAxionInstance";
import { loadStripe } from "@stripe/stripe-js";
import Loading from "../spinner/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Review from "./Review";

function TrainerProfileView() {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isSingleSession, setIsSingleSession] = useState(true);
  const [sessionSchedules, setSessionSchedules] = useState<ISessionSchedule[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ISessionSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string | null>(null);
  const [reload, setReload] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState<boolean>(false);
  const [userReviewId, setUserReviewId] = useState<string | null>(null);
  const [avgRatingAndTotalReviews, setAvgRatingAndTotalReviews] = useState<AvgRatingAndReviews[]>([]);

  const { userInfo } = useSelector((state: RootState) => state.user);
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();
  if (!trainerId) {
    return <div>No trainer ID found</div>;
  }

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.BASE_URL}/api/user/trainers/${trainerId}`
        );
        setTrainer(response.data[0]);
      } catch (error) {
        console.error("Error fetching trainer:", error);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  const handleBooking = (session: ISessionSchedule) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handlePayment = async (sessionId: string) => {
    try {
      if (userInfo) {
        setLoading(true);
        const response = await userAxiosInstance.post(
          `/api/user/payment/${sessionId}`,
          { userData: userInfo }
        );
        const stripe = await loadStripe(
          import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        );
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: response.data.id });
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSingleSession = () => {
    setIsSingleSession(true);
  };

  const handlePackageSession = () => {
    setIsSingleSession(false);
  };

  useEffect(() => {
    const fetchSeessionSchedules = async () => {
      const response = await axios.get(`${import.meta.env.BASE_URL}/api/user/schedules`);
      setSessionSchedules(response.data);
    };
    fetchSeessionSchedules();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const filtered = sessionSchedules.filter(
      (session) =>
        session.trainerId === trainerId &&
        session.isSingleSession === isSingleSession &&
        new Date(session.startDate).toLocaleDateString() ===
        selectedDate.toLocaleDateString() &&
        session.isBooked == false
    );
  }, [selectedDate, isSingleSession, sessionSchedules, trainerId]);

  const sessionDates = Array.from(
    new Set(
      sessionSchedules
        .filter(
          (session) =>
            session.trainerId === trainerId &&
            session.isSingleSession === isSingleSession &&
            session.isBooked === false
        )
        .map((session) => new Date(session.startDate).toDateString())
    )
  ).map((dateStr) => new Date(dateStr));

  const bookingRef = useRef<HTMLDivElement>(null);

  const handleBookSessionClick = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleEditReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleStarClick = (rating: any) => {
    setSelectedRating(rating);
  };

  const handleReviewSubmit = async () => {
    const data = {
      reviewComment,
      selectedRating,
      userId: userInfo?.id,
      trainerId,
    };

    const response = await userAxiosInstance.post(`/api/user/review`, data);

    setUserReviewId(response.data.reviewId);
    setIsReviewModalOpen(false);
    setReviewComment(null);
    setSelectedRating(0);
    setReload((prev) => !prev);
    if (response.data.message) {
      toast.success(response.data.message);
    }
  };

  const handleReviewEdit = async () => {
    const data = {
      reviewComment,
      selectedRating,
      userReviewId,
    };
    const response = await userAxiosInstance.patch(
      `/api/user/edit-review`,
      data
    );
    setIsReviewModalOpen(false);
    setReviewComment(null);
    setSelectedRating(0);
    setReload((prev) => !prev);
    if (response.data.message) {
      toast.success(response.data.message);
    }
  };

  useEffect(() => {
    const findBooking = async () => {
      const response = await userAxiosInstance.get(
        `/api/user/bookings/${userInfo?.id}/${trainerId}`
      );
      setBookingStatus(response.data);
    };

    findBooking();
  }, []);

  useEffect(() => {
    const getAvgRatingAndTotalReviews = async () => {
      const response = await userAxiosInstance.get(
        `/api/user/reviews-summary/${trainerId}`
      );
      setAvgRatingAndTotalReviews(response.data);
    };
    getAvgRatingAndTotalReviews();
  }, [trainerId]);

  return (
    <div className="mb-40">
      <Toaster />
      <div>
        <img
          className="w-full h-[37vh] object-cover"
          src={profileBG}
          alt="Profile Background"
        />
      </div>

      <div className="absolute top-36 md:top-40 left-4 sm:left-8 md:left-32 flex flex-col sm:flex-row items-center sm:justify-center">
        <img
          src={trainer?.profileImage}
          alt="Profile"
          className="w-36 h-36 sm:w-52 sm:h-52 rounded-full bg-slate-500 object-cover border-4 border-white shadow-lg"
        />
        <div className="flex flex-col mt-4 sm:mt-0 sm:ml-10 items-center sm:items-start text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-bold mt-4 sm:mt-40 rounded-lg">
            {trainer?.name}
          </h1>
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 mt-2">
            {trainer?.specializations.map((spec) => spec.name).join(", ")}
          </h2>
        </div>
      </div>

      <div className="mt-24 sm:mt-36 mx-4 sm:mx-8 md:mx-auto border-b-2 border-gray-300"></div>

      <div className="flex flex-col sm:flex-row justify-normal">
        <div className="mx-4 sm:mx-8 md:mx-auto mt-8 sm:mt-8 md:ml-36 flex flex-col items-center sm:items-start">
          {/* Rating and Reviews */}
          <div>
            <h1 className="text-4xl sm:text-6xl font-semibold">
              {avgRatingAndTotalReviews[0]?.averageRating
                ? `${avgRatingAndTotalReviews[0].averageRating}.0`
                : "0.0"}
            </h1>
          </div>
          <div className="flex justify-center sm:justify-start mt-2">
            <div className="text-blue-500 text-2xl sm:text-3xl">
              {[...Array(5)].map((_, index) => (
                <span key={index}>
                  {index < avgRatingAndTotalReviews[0]?.averageRating ? "★" : "☆"}
                </span>
              ))}
            </div>

            {avgRatingAndTotalReviews.length > 0 && (
              <h2 className="ml-2 text-blue-500 text-lg sm:text-2xl">
                {avgRatingAndTotalReviews[0].totalReviews} reviews
              </h2>
            )}
          </div>
          <button
            className="bg-gradient-to-b from-blue-500 to-blue-500 text-white font-bold py-2 px-4 w-48 sm:w-64 mt-7 rounded-2xl shadow-md"
            onClick={handleBookSessionClick}
          >
            Book Session
          </button>
        </div>

        <div className="bg-blue-50 rounded-md p-6 sm:p-10 mt-6 sm:mt-10 mx-4 sm:ml-10 sm:mr-36">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-5 sm:mb-7">
            About {trainer?.name}
          </h1>
          <p className="text-center sm:text-left font-normal">
            {trainer?.about ||
              "This trainer hasn't provided an about description yet."}
          </p>
          <p className="mt-5 font-medium text-center sm:text-left">
            Languages: {trainer?.language}
          </p>
        </div>
      </div>


      <div className="bg-blue-500 h-auto mt-20">
        <div
          ref={bookingRef}
          className="flex flex-col sm:flex-row justify-between items-center p-5 sm:p-10 mt-10"
        >
          <img src={LOGO} alt="logo" className="w-40 sm:w-80 h-auto" />

          <DatePicker
            minDate={new Date()}
            selected={selectedDate}
            inline
            highlightDates={sessionDates}
            onChange={(date) => setSelectedDate(date)}
            className="h-auto w-full sm:w-80 border border-gray-300 rounded-lg shadow-lg p-2 mt-5 sm:mt-0"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center mt-5 sm:mt-10">
          <div className="border-b-2 border-b-black w-40 sm:w-96 mb-2 sm:mb-0 sm:mr-10"></div>
          <h1 className="font-semibold text-center">
            {selectedDate
              ? selectedDate.toDateString()
              : new Date().toDateString()}
          </h1>
          <div className="border-b-2 border-b-black w-40 sm:w-96 mt-2 sm:mt-0 sm:ml-10"></div>
        </div>

        <div className="flex justify-center mt-10 sm:mt-20">
          <div className="bg-blue-50 rounded-md shadow-lg p-4 sm:p-6 w-[95%] sm:w-[80%] h-auto sm:h-[75vh] overflow-y-auto">
            {/* Button section */}
            <div className="mt-5 space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
              <button
                onClick={handleSingleSession}
                className={`${isSingleSession
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-500 hover:bg-gray-600"
                  } text-white px-4 py-3 shadow-md w-full sm:w-auto`}
              >
                Single Session
              </button>
              <button
                onClick={handlePackageSession}
                className={`${isSingleSession
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-blue-500 hover:bg-blue-600"
                  } text-white px-4 py-3 shadow-md w-full sm:w-auto`}
              >
                Package Sessions
              </button>
            </div>

            <div className="p-3 sm:p-5 mt-5 sm:mt-8 max-h-[50vh] overflow-y-auto">
              {sessionSchedules.filter(
                (session) =>
                  session.isSingleSession === isSingleSession &&
                  session.trainerId === trainerId &&
                  (!selectedDate ||
                    (new Date(session.startDate).toLocaleDateString() ===
                      selectedDate.toLocaleDateString() &&
                      session.isBooked === false))
              ).length === 0 ? (
                <div className="flex justify-center">
                  <h1 className="text-black text-center">
                    {isSingleSession
                      ? "No Single Sessions available."
                      : "No Packages available."}
                  </h1>
                </div>
              ) : (
                sessionSchedules
                  .filter(
                    (session) =>
                      session.isSingleSession === isSingleSession &&
                      session.trainerId === trainerId &&
                      (!selectedDate ||
                        new Date(session.startDate).toLocaleDateString() ===
                        selectedDate.toLocaleDateString()) &&
                      session.isBooked === false
                  )
                  .map((session) => (
                    <div key={session._id} className="mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="text-center sm:text-left">
                          <h1 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                            {session.specializationId.name}
                          </h1>

                          <h1 className="font-medium text-lg sm:text-2xl">
                            Time: {formatTime(session.startTime)} - {" "}
                            {formatTime(session.endTime)}
                          </h1>
                          <p>
                            Duration: (
                            {calculateDuration(
                              session.startTime,
                              session.endTime
                            )}
                            )
                          </p>
                          {!isSingleSession && (
                            <h1 className="font-medium text-lg sm:text-2xl mt-2">
                              Number of Sessions: {" "}
                              {numberOfSessions(
                                session.startDate,
                                session.endDate
                              )}
                            </h1>
                          )}
                        </div>

                        <div className="h-px sm:h-10 w-full sm:w-px bg-gray-300 my-5 sm:my-0 sm:mx-5"></div>

                        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 text-center sm:text-left">
                          <div>
                            <h1 className="font-medium text-lg sm:text-2xl">
                              Price: {formatPriceToINR(session.price)}
                            </h1>
                            {!isSingleSession && (
                              <h1 className="text-gray-600">
                                {new Date(
                                  session.startDate
                                ).toLocaleDateString()} {" "}
                                - {" "}
                                {new Date(
                                  session.endDate
                                ).toLocaleDateString()}
                              </h1>
                            )}
                          </div>
                          <button
                            onClick={() => handleBooking(session)}
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-3 text-white mt-4 sm:mt-0"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-center mt-4">
                        <div className="border-b-2 border-b-gray-300 w-full"></div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Checkout modal  */}

      {isModalOpen && selectedSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div>
            {!loading ? (
              <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-2xl shadow-lg h-[85vh] overflow-y-auto relative sm:h-auto sm:rounded-none sm:w-full sm:p-4">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl focus:outline-none sm:top-2 sm:right-2 sm:text-xl"
                  onClick={closeModal}
                >
                  <AiOutlineClose />
                </button>

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4 sm:text-2xl">
                  Confirm Your Booking
                </h1>
                <p className="text-center text-gray-500 mb-8 sm:mb-4 sm:text-sm">
                  Review your booking details below before proceeding to payment.
                </p>

                <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-8 sm:p-4 sm:mb-4">
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-1 sm:gap-4">
                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700 mb-2 sm:mb-1 text-sm">
                        Trainer Name
                      </label>
                      <p className="text-gray-900 sm:text-sm">{trainer?.name}</p>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700 mb-2 sm:mb-1 text-sm">
                        Specialization Name
                      </label>
                      <p className="text-gray-900 sm:text-sm">
                        {selectedSession.specializationId.name}
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700 mb-2 sm:mb-1 text-sm">
                        Date and Time
                      </label>
                      {selectedSession.isSingleSession ? (
                        <>
                          <p className="text-gray-900 sm:text-sm">
                            Starting Date: {new Date(selectedSession.startDate).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-900 sm:text-sm">
                            Starting Date: {new Date(selectedSession.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-900 sm:text-sm">
                            Ending Date: {new Date(selectedSession.startDate).toLocaleDateString()}
                          </p>
                        </>
                      )}
                      <p className="text-gray-900 sm:text-sm">
                        Time: {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <label className="font-semibold text-gray-700 sm:mb-1 text-sm">
                        Duration
                      </label>
                      <p className="text-gray-900 sm:text-sm">
                        {calculateDuration(selectedSession.startTime, selectedSession.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg shadow mb-8 text-center sm:p-3 sm:mb-4">
                  <label className="font-semibold text-lg text-blue-700 sm:text-sm">
                    Total Cost
                  </label>
                  <p className="text-2xl font-bold text-blue-900 sm:text-lg">
                    ₹ {selectedSession.price}
                  </p>
                </div>

                <button
                  onClick={() => handlePayment(selectedSession._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-200 shadow-md sm:py-2 sm:text-sm"
                >
                  Proceed to Payment
                </button>
              </div>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <h1 className="text-2xl mt-5 font-bold sm:text-xl sm:mt-3">
          {bookingStatus === "Completed" ? "What clients are saying" : ""}
        </h1>
      </div>
      {bookingStatus === "Completed" ? (
        <div className="flex justify-end mr-10 sm:mr-4">
          {!hasUserReviewed ? (
            <button
              onClick={handleAddReview}
              className="bg-red-500 lg:mr-5 lg:px-4 lg:py-3 text-white sm:px-2 sm:py-1 sm:text-sm"
            >
              Add Review
            </button>
          ) : (
            <button
              onClick={handleEditReview}
              className="bg-red-500 px-3 py-2 text-white  sm:px-2 sm:py-1 sm:text-sm"
            >
              Edit Review
            </button>
          )}
        </div>
      ) : (
        ""
      )}
      <Review
        trainerId={trainerId}
        reload={reload}
        currentUeser={userInfo?.id}
        onReviewCheck={(hasReview) => setHasUserReviewed(hasReview)}
      />

      {isReviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-2xl shadow-lg h-[55vh] overflow-y-auto relative sm:p-4 sm:h-auto">
            <h1 className="font-bold text-2xl sm:text-xl">
              {hasUserReviewed ? "Edit Review" : "Write a Review"}
            </h1>
            <h1 className="font-medium mt-3 sm:text-base">Select Your Rating</h1>
            <div className="text-yellow-600 text-lg sm:text-base">
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={`w-7 h-7 ms-1 cursor-pointer sm:w-5 sm:h-5 ${star <= selectedRating ? "text-yellow-600" : "text-gray-300"
                      }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                    aria-hidden="true"
                  >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                  </svg>
                ))}
              </div>
              <div className="mt-3">
                <textarea
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Write your review here..."
                  rows={6}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 sm:gap-2 mt-4">
              <button
                className="bg-red-500 px-3 py-2 rounded-md text-white sm:px-2 sm:py-1 sm:text-sm"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Close
              </button>
              {!hasUserReviewed ? (
                <button
                  onClick={handleReviewSubmit}
                  className="bg-blue-500 px-3 py-2 rounded-md text-white sm:px-2 sm:py-1 sm:text-sm"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleReviewEdit}
                  className="bg-blue-500 px-3 py-2 rounded-md text-white sm:px-2 sm:py-1 sm:text-sm"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TrainerProfileView;
