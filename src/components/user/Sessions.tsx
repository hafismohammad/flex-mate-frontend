import { useEffect, useState } from "react";
import userAxiosInstance from "../../../axios/userAxionInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { IBookedSession } from "../../types/user";
import { formatTime } from "../../utils/timeAndPriceUtils";
import { useNavigate } from "react-router-dom";

function Sessions() {
  const [sessions, setSessions] = useState<IBookedSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 3;

  const { userInfo } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const response = await userAxiosInstance.get(
        `/api/user/bookings-details/${userInfo?.id}`
      );
      const activeSessions = response.data.filter(
        (sessions: IBookedSession) => sessions.bookingStatus === "Confirmed"
      );
      setSessions(activeSessions);
    };
    fetchBookingDetails();
  }, [userInfo?.id]);

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessions.slice(
    indexOfFirstSession,
    indexOfLastSession
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(sessions.length / sessionsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
    <div className="flex justify-center mt-5">
      <div className="h-[80vh] bg-white w-[75%] shadow-md rounded-md overflow-y-auto p-3">
        <h1 className="p-2 font-bold text-2xl">Upcoming Sessions</h1>
  
        {currentSessions.length > 0 ? (
          currentSessions.map((session, index) => (
            <div
              key={`${session.bookingId}-${index}`}
              className="h-[20vh] bg-blue-50 rounded-xl flex items-center justify-between px-6 mb-4"
            >
              <div className="flex items-center">
                <div className="w-20 h-20 mr-4">
                  <img
                    src={session.trainerImage}
                    alt="trainer-img"
                    className="rounded-full w-full h-full object-cover bg-black"
                  />
                </div>
  
                <div>
                  <h2 className="text-lg font-semibold">{session.trainerName}</h2>
                  <p className="text-gray-600">{session.specialization}</p>
  
                  <div className="mt-3">
                    {session.sessionType === "Single Session" ? (
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Date: </span>
                        {new Date(session.sessionDates.startDate).toDateString()}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Start Date: </span>
                          {new Date(session.sessionDates.startDate).toDateString()}
                        </p>
                        {session.sessionDates.endDate && (
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">End Date: </span>
                            {new Date(session.sessionDates.endDate).toDateString()}
                          </p>
                        )}
                      </>
                    )}
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Time: </span>
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Session Type: </span>
                      {session.sessionType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No upcoming sessions available</p>
        )}
      </div>
    </div>
  
    <div className="flex justify-center mt-4 w-full sm:w-[75%]">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50 sm:px-6 sm:py-3"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-gray-700 text-sm sm:text-base">
        Page {currentPage} of {Math.ceil(sessions.length / sessionsPerPage)}
      </span>
      <button
        onClick={nextPage}
        disabled={currentPage === Math.ceil(sessions.length / sessionsPerPage)}
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50 sm:px-6 sm:py-3"
      >
        Next
      </button>
    </div>
  </div>
  
  );
}

export default Sessions;
