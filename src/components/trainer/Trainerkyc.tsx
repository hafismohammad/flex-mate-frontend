import React, { useState, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { submitKyc } from "../../actions/trainerAction";
import { useNavigate } from "react-router-dom";
import Loading from "../spinner/Loading";
import toast, { Toaster } from "react-hot-toast";

const TrainerKyc: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [aadhaarFrontSide, setAadhaarFrontSide] = useState<File | null>(null);
  const [aadhaarBackSide, setAadhaarBackSide] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const { trainerToken, trainerInfo , loading} = useSelector(
    (state: RootState) => state.trainer
  );
  const token = trainerToken;
  const trainer_id = trainerInfo?.id;
  const specialization = trainerInfo?.specialization;

  const dispatch = useDispatch<AppDispatch>();

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    if (!phone) errors.phone = "Phone number is required";
    if (!profileImage) errors.profileImage = "Profile image is required";
    if (!aadhaarFrontSide) errors.aadhaarFrontSide = "Aadhaar front side is required";
    if (!aadhaarBackSide) errors.aadhaarBackSide = "Aadhaar back side is required";
    if (!certificate) errors.certificate = "Certificate is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    const isValidImage = (file: File | null) => {
      if (file && !allowedTypes.includes(file.type)) {
        return false;
      }
      return true;
    };
  
    if (
      !isValidImage(profileImage) ||
      !isValidImage(aadhaarFrontSide) ||
      !isValidImage(aadhaarBackSide) ||
      !isValidImage(certificate)
    ) {
      toast.error("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
      return;
    }
  
    const formData = new FormData();
    formData.append('trainer_id', trainer_id!);
  
    if (Array.isArray(specialization)) {
      specialization.forEach((spec) => {
        formData.append('specialization[]', spec);
      });
    } else {
      formData.append('specialization', specialization!);
    }
  
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
  
    // Append files only if they exist
    if (profileImage) formData.append('profileImage', profileImage);
    if (aadhaarFrontSide) formData.append('aadhaarFrontSide', aadhaarFrontSide);
    if (aadhaarBackSide) formData.append('aadhaarBackSide', aadhaarBackSide);
    if (certificate) formData.append('certificate', certificate);
  
    if (!token) {
      toast.error("Authorization token is required.");
      return;
    }
  
    try {
      await dispatch(submitKyc({ formData }));
    } catch (error) {
      toast.error("Failed to submit KYC. Please try again.");
    }
  };
  
  

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0] || null;
    setState(file);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Toaster />
      {loading && <Loading />}
      <h1 className="text-3xl font-bold mb-6 text-center">KYC Submission</h1>
      <p className="mb-6 text-center text-gray-600">
        Please fill in the details below to complete your KYC submission.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block mb-2">
              Name:
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                name="name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {formErrors.name && (
                <p className="text-red-500">{formErrors.name}</p>
              )}
            </label>
            <label className="block mb-2">
              Email:
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                name="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {formErrors.email && (
                <p className="text-red-500">{formErrors.email}</p>
              )}
            </label>
            <label className="block mb-2">
              Phone Number:
              <input
                onChange={(e) => setPhone(e.target.value)}
                type="text"
                name="phone"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {formErrors.phone && (
                <p className="text-red-500">{formErrors.phone}</p>
              )}
            </label>
            <label className="block mb-2">
              Profile Image:
              <input
                onChange={(e) => handleFileChange(e, setProfileImage)}
                type="file"
                required
                className="flex-1 border border-gray-300 rounded-md p-2"
              />
              {formErrors.profileImage && (
                <p className="text-red-500">{formErrors.profileImage}</p>
              )}
            </label>
          </div>
        </div>

        <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">KYC Document Upload</h2>

          <div className="flex items-center mb-4 space-x-4">
            <h2 className="w-1/4"> Aadhaar Front Side</h2>
            <input
              onChange={(e) => handleFileChange(e, setAadhaarFrontSide)}
              type="file"
              required
              className="flex-1 border border-gray-300 rounded-md p-2"
            />
            {formErrors.aadhaarFrontSide && (
              <p className="text-red-500">{formErrors.aadhaarFrontSide}</p>
            )}
          </div>

          <div className="flex items-center mb-4 space-x-4">
            <h2 className="w-1/4"> Aadhaar Back Side</h2>
            <input
              onChange={(e) => handleFileChange(e, setAadhaarBackSide)}
              type="file"
              required
              className="flex-1 border border-gray-300 rounded-md p-2"
            />
            {formErrors.aadhaarBackSide && (
              <p className="text-red-500">{formErrors.aadhaarBackSide}</p>
            )}
          </div>

          <div className="flex items-center mb-4 space-x-4">
            <h2 className="w-1/4">Certificate</h2>
            <input
              onChange={(e) => handleFileChange(e, setCertificate)}
              type="file"
              required
              className="flex-1 border border-gray-300 rounded-md p-2"
            />
            {formErrors.certificate && (
              <p className="text-red-500">{formErrors.certificate}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md shadow hover:bg-blue-700"
        >
          Submit KYC
        </button>
      </form>
    </div>
  );
};

export default TrainerKyc;
