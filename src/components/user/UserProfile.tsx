import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { User } from "../../features/user/userTypes";
import userAxiosInstance from "../../../axios/userAxionInstance";
import toast, { Toaster } from "react-hot-toast";

function UserProfile() {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [formData, setFormData] = useState<User>({ id: "", name: "", phone: "", email: "", password: "", dob: "", gender: "",});
  const [passwordVisibility, setPasswordVisibility] = useState({current: false, new: false, confirm: false,});


  const [editOpen, setEditOpen] = useState(false);
  const userId = userInfo?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await userAxiosInstance.get(
          `/api/user/users/${userId}`
        );
        setFormData(response.data);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };
    fetchUserDetails();
  }, [userId]);

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await userAxiosInstance.patch(
        "/api/user/update-user",
        formData
      );
      setEditOpen(false);
      if (response.status === 200) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error);
      console.error("Failed to update user details", error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
  
      if (confirmPassword !== newPassword) {
        toast.error('New password and confirm password do not match!');
        return;
      }
  
      if (newPassword.trim() === '') {
        toast.error('Password cannot be empty or contain only spaces.');
        return;
      }
  
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }
  
      const data = {
        currentPassword,
        newPassword,
      };
  
      const response = await userAxiosInstance.patch(`/api/user/reset-password/${userInfo?.id}`, data);
  
      if (response.status === 200) {
        toast.success(response.data.message || 'Password reset successfully!');
      }
    } catch (error: any) {
      console.error(error);
  
      const errorMessage = error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }
  };
  

  const togglePasswordVisibility = (field: string) => {
    setPasswordVisibility((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  

  return (
    <>
      <div className="flex justify-center mt-7">
        <Toaster />
        {!editOpen ? (
          <div className="h-[75vh] bg-white w-[75%] shadow-md rounded-md overflow-y-auto">
            <h1 className="p-5 font-bold text-2xl">Personal Information</h1>
            <div className="mt-5 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Name
                </label>
                <div className="border border-gray-500 p-2 rounded-md">
                  <h1 className="text-gray-800">{formData.name}</h1>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Email
                </label>
                <div className="border border-gray-500 p-2 rounded-md">
                  <h1 className="text-gray-800">{formData.email}</h1>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Phone
                </label>
                <div className="border border-gray-500 p-2 rounded-md">
                  <h1 className="text-gray-800">{formData.phone}</h1>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Birthday
                </label>
                <div className="border border-gray-500 p-2 rounded-md">
                  <h1 className="text-gray-800">
                    {formData.dob || "Not specified"}
                  </h1>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Gender
                </label>
                <div className="border border-gray-500 p-2 rounded-md">
                  <h1 className="text-gray-800">
                    {formData.gender || "Not specified"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-8">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[75vh] bg-white w-[75%] shadow-md rounded-md overflow-y-auto">
            <h1 className="p-5 font-bold text-2xl">
              Edit Personal Information
            </h1>
            <form onSubmit={handleProfileUpdate}>
              <div className="mt-5 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-500 p-2 rounded-md w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    readOnly
                    value={formData.email}
                    onChange={handleChange}
                    className="border border-gray-500 p-2 rounded-md w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border border-gray-500 p-2 rounded-md w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob || ""}
                    onChange={handleChange}
                    className="border border-gray-500 p-2 rounded-md w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="border border-gray-500 p-2 rounded-md w-full"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end p-8">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-5">
        <div className="h-[55vh] bg-white w-[45%] shadow-md rounded-md">
          <h1 className="p-5 font-bold text-2xl">Reset Password</h1>
          <div className="mt-5 max-w-4xl gap-6 p-8">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Old Password
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type={passwordVisibility.current ? "text" : "password"}
                  name="oldPassword"
                  className="border border-gray-500 p-2 rounded-md w-full"
                  // placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {passwordVisibility.current ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={passwordVisibility.new ? "text" : "password"}
                  name="newPassword"
                  className="border border-gray-500 p-2 rounded-md w-full"
                  // placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {passwordVisibility.new ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={passwordVisibility.confirm ? "text" : "password"}
                  name="confirmPassword"
                  className="border border-gray-500 p-2 rounded-md w-full"
                  // placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {passwordVisibility.confirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleResetPassword}
                type="submit"
                className="py-3 rounded-md px-2 bg-blue-500 text-white font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

 
    </>
  );
}

export default UserProfile;
