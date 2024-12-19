import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../app/store';
import { trainerVerifyOtp } from '../../actions/trainerAction';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

interface Errors {
  otp?: string;
}

function TrainerOtp() {
  const [otp, setOtp] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [seconds, setSeconds] = useState<number>(60);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  const location = useLocation();
  const trainerData = location.state;
  const { trainerInfo, error } = useSelector((state: RootState) => state.trainer);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const validate = () => {
    const newError: Errors = {};
    if (!otp.trim()) {
      newError.otp = "Please enter OTP";
    } else if (otp.length !== 4) {
      newError.otp = "OTP should be 4 digits";
    }
    return newError;
  };

  const clearErrors = () => {
    setTimeout(() => {
      setErrors({});
    }, 3000);
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const otpErrors = validate();
    setErrors(otpErrors);

    if (Object.keys(otpErrors).length > 0) {
      clearErrors();
      return;
    }

    if (trainerData) {
      const response = await dispatch(trainerVerifyOtp({ trainerData, otp }));
      if (response.meta.requestStatus === "fulfilled") {
        setOtpVerified(true);
        toast.success("Registration successful");
      } else {
        toast.error("Invalid OTP");
      }
    }
  };

  const resendOtp = async () => {
    try {
      
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/trainer/resend-otp`, { email: trainerData.email });
      setSeconds(60);
      setIsDisabled(true);
      toast.success("OTP resented");
    } catch (error) {
      toast.error("Error resending OTP");
      console.error("Error resending OTP:", error);
    }
  };

  // Timer logic to re-enable the Resend OTP button
  useEffect(() => {
    if (seconds > 0) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsDisabled(false);
    }
  }, [seconds]);

  useEffect(() => {
    if (otpVerified) {
      navigate("/trainer/login");
    }
  }, [otpVerified, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <Toaster />
      <div className="w-[40%] bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Enter OTP</h2>
        <p className="text-center text-gray-500 mb-8">Please enter the 4-digit OTP sent to your mobile number.</p>
        <div className="mt-4">
          <input
            type="text"
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            value={otp}
            className="block w-full mt-10 mb-10 border border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
        </div>

        <button
          onClick={handleClick}
          className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Verify OTP
        </button>

        <button
          onClick={resendOtp}
          disabled={isDisabled}
          className={`w-full mt-4 py-2 px-4 ${
            isDisabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-md transition duration-200`}
        >
          {isDisabled ? `Resend OTP in ${seconds}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

export default TrainerOtp;
