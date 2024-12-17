import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import TrainerKyc from "./Trainerkyc";
import { useEffect, useState } from "react";

function KycRejectionStatus() {
  const [isResubmitted, setIsResubmitted] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('')

  const { trainerInfo } = useSelector((state: RootState) => state.trainer);
  const trainerId = trainerInfo.id;

  const handleResubmit = async () => {
    try {
      const response = await axiosInstance.put(
        `/api/trainer/kyc/resubmit/${trainerId}`
      );

      if (response.status === 200) {
        setIsResubmitted(true);
      }
    } catch (error) {
      console.error("Error resubmitting KYC:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/api/trainer/rejection-reason/${trainerId}`);
        setRejectionReason(response.data.reason)
      } catch (error) {
        console.error('Error fetching rejection data:', error);
      }
    };
  
    fetchData();
  }, []); // Dependency array ensures this runs only once when the component mounts
  
  
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      {isResubmitted ? (
        <TrainerKyc />
      ) : (
        <div className="flex items-center justify-center h-screen  bg-gray-100">
          <div className="max-w-4xl mx-auto p-10 bg-white rounded-lg shadow-md text-center">
            <h1 className="text-3xl font-semibold text-red-500 mb-4">
              Your KYC information has been rejected.
            </h1>
            <p className="text-lg text-gray-800 mb-4">
              We regret to inform you that your application has been rejected.
            </p>
            <p className="text-lg text-gray-600 mb-6">{rejectionReason}</p>
            <button
              onClick={handleResubmit}
              className="bg-blue-500 text-white text-lg py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Resubmit Your KYC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KycRejectionStatus;
