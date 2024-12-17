import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import userAxiosInstance from '../../../axios/userAxionInstance';
import { useSocketContext } from '../../context/Socket';
import { useNotification } from '../../context/NotificationContext ';

function SuccessPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const userId = queryParams.get('user_id');
  const stripe_session_id = queryParams.get('stripe_session_id');
  const { socket } = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const { addTrainerNotification } = useNotification()

  useEffect(() => {
    let isMounted = true;

    const createBooking = async () => {
      const bookingKey = `bookingCreated-${stripe_session_id}`;
      const bookingCreated = localStorage.getItem(bookingKey);

      if (sessionId && userId && stripe_session_id && !bookingCreated) {
        setIsLoading(true);
        try {
          const response = await userAxiosInstance.post('/api/user/bookings', {
            sessionId,
            userId,
            stripe_session_id,
          });
          const notificationData = {
            receiverId: response.data.trainerId,
            content: `New booking for ${response.data.sessionType} (${response.data.specialization}) on ${new Date(response.data.startDate).toDateString()} at ${response.data.startTime}. Amount: $${response.data.amount}.`,
          };
          socket?.emit('newBookingNotification', notificationData);
          addTrainerNotification(notificationData.content)

          localStorage.setItem(bookingKey, 'true');
        } catch (error) {
          console.error('Error creating booking:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isMounted) createBooking();

    return () => {
      isMounted = false;
    };
  }, [sessionId, userId, stripe_session_id, socket]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg text-center">
        <div className="text-green-500 text-7xl flex justify-center animate-jump-in animate-once animate-duration-[2000ms]">
          <FaCheckCircle />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Payment Successful!</h1>
        <p className="text-gray-600 mt-2">
          Thank you for your payment. Your transaction has been completed.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            Go to Homepage
          </button>
          <button
            onClick={() => navigate('/profile/bookings')}
            className={`ml-4 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPayment;


