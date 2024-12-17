import React from "react";
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

function FailedPayment() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg text-center">
        <div className="text-red-500 text-7xl flex justify-center animate-jump-in animate-once animate-duration-[2000ms]">
          <FaTimesCircle />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Payment Failed</h1>
        <p className="text-gray-600 mt-2">
          Unfortunately, your payment could not be processed. Please check your payment details or try again later.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate('#')}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
          >
            Retry Payment
          </button>
          <button
            onClick={() => navigate('/')}
            className="ml-4 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default FailedPayment;
