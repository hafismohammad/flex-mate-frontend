import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaUser, FaFileAlt, FaCheck, FaTimes } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";
import adminAxiosInstance from "../../../axios/adminAxiosInstance";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import Loading from "../spinner/Loading";
import {setLoading} from '../../features/admin/adminSlice'
import { useDispatch } from "react-redux";


interface Errors {
  rejectionReason?: string;
}

interface Trainer {
  trainerName: string;
  trainerEmail: string;
  trainerPhone: string;
  specialization: string;
  profileImage: string;
  aadhaarFrontImage: string;
  aadhaarBackImage: string;
  certificate: string;
  kycStatus: string;
  kycSubmissionDate: string;
}

function TrainerView() {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});


  const {loading} = useSelector((state: RootState) => state.admin)
  const { trainerId } = useParams();
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    const fetchTrainerDetails = async () => {
      try {
        dispatch(setLoading(true));
        const response = await adminAxiosInstance.get(
          `/api/admin/trainers/kyc/${trainerId}`
        );
        const trainerData = response.data.kycData;
        const kycData = trainerData._doc;
  
        if (trainerData) {
          const specializations = kycData.specializationId
            .map((spec: { name: string }) => spec.name)
            .join(", "); 
  
          const data: Trainer = {
            trainerName: kycData.trainerId.name,
            trainerEmail: kycData.trainerId.email,
            trainerPhone: kycData.trainerId.phone,
            specialization: specializations, 
            profileImage: kycData.profileImage,
            aadhaarFrontImage: kycData.aadhaarFrontImage,
            aadhaarBackImage: kycData.aadhaarBackImage,
            certificate: kycData.certificate,
            kycStatus: kycData.kycStatus,
            kycSubmissionDate: new Date(kycData.createdAt).toLocaleDateString(),
          };
  
          setTrainer(data);
        } else {
          console.warn("No trainer data found");
        }
      } catch (error) {
        console.error("Error fetching trainer data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };
  
    fetchTrainerDetails();
  }, [trainerId]);
  

  const handleApproveStatusChange = async (newStatus: string) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
         try {
          await adminAxiosInstance.patch(`/api/admin/kyc-status-update/${trainerId}`, { status: newStatus });
          setTrainer((prevTrainer) => prevTrainer ? { ...prevTrainer, kycStatus: newStatus } : null);
          navigate('/admin/verification')
  
            Swal.fire("Canceled!", "Trainer Approved.", "success");
          } catch (error) {
            console.error("Error canceling booking:", error);
            Swal.fire("Error", "Could not cancel the booking.", "error");
          }
        }
      });
    
    } catch (error) {
      console.error("Error updating trainer status:", error);
    } 
  };

  const handleRejectStatusChange = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setRejectionReason("");
  };

  const validate = (): boolean => {
    let isValid = true;
    const newErrors: Errors = {};

    if (!rejectionReason.trim()) {
      newErrors.rejectionReason = "Please provide a rejection reason.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      setTimeout(() => {
        setErrors({});
      }, 3000);
    }

    return isValid;
  };

  const handleReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      dispatch(setLoading(true));
      await adminAxiosInstance.patch(`/api/admin/kyc-status-update/${trainerId}`, {
        status: "rejected",
        rejectionReason,
      });
      setTrainer((prevTrainer) =>
        prevTrainer ? { ...prevTrainer, kycStatus: "rejected" } : null
      );
      closeModal();
      navigate('/admin/verification')
    } catch (error) {
      console.error("Error updating trainer status with rejection reason:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      {loading && <Loading />}

      <h2 className="text-2xl font-bold mb-6">Trainer Details</h2>

      {trainer ? (
        <>
          <div className="mb-6">
          <div>
                <img
                  src={trainer.profileImage}
                  alt="Profile"
                  className="w-40 h-40 border r rounded-full "
                />
              </div>
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold">{trainer.trainerName}</h3>
            </div>
            <p className="text-gray-600">{trainer.trainerEmail}</p>
            <p className="text-gray-600">Phone: {trainer.trainerPhone}</p>
          </div>

          <div className="mb-6 border-t border-gray-300 pt-4">
            <h4 className="font-medium text-lg mb-2">KYC Information</h4>
            <p className="text-sm text-gray-500">KYC Submission Date: {trainer.kycSubmissionDate}</p>
            <p className="text-sm text-gray-500">Status: {trainer.kycStatus}</p>
            <p className="text-sm text-gray-500">Specialization: {trainer.specialization}</p>
          </div>

          <div className="mb-6 border-t border-gray-300 pt-4">
            <h4 className="font-medium text-lg mb-2">Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
              <div>
                <h5 className="font-medium">Aadhaar Front Image</h5>
                <a  href={trainer.aadhaarFrontImage} target="_blank" rel="noopener noreferrer">
                <img
                  src={trainer.aadhaarFrontImage}
                  alt="Aadhaar Front"
                  className="w-40 h-40 border"
                />
                </a>
              </div>
              <div>
                <h5 className="font-medium">Aadhaar Back Image</h5>
                <a  href={trainer.aadhaarBackImage} target="_blank" rel="noopener noreferrer">
                <img
                  src={trainer.aadhaarBackImage}
                  alt="Aadhaar Back"
                  className="w-40 h-40 border"
                />
                </a>
              </div>
              <div>
                <h5 className="font-medium">Certificate</h5>
               <a href={trainer.certificate} target="_blank" rel="noopener noreferrer">
               <img
                  src={trainer.certificate}
                  alt="Certificate"
                  className="w-40 h-40 border"
                />
               </a>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleApproveStatusChange("approved")}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FaCheck className="mr-1" /> Approve
            </button>
            <button
              onClick={handleRejectStatusChange}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FaTimes className="mr-1" /> Reject
            </button>
          </div>
        </>
      ) : (
        <p>No trainer details available.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
           {loading && <Loading />}
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Rejection Reason</h3>
            <form onSubmit={handleReasonSubmit}>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason."
                className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.rejectionReason && (
                <div className="text-red-500 mb-2">{errors.rejectionReason}</div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 mr-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg font-semibold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainerView;
