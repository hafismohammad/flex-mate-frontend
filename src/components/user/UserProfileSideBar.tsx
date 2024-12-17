import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../actions/userAction";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import userAxiosInstance from "../../../axios/userAxionInstance";
import toast from "react-hot-toast";
import profileDummy from "../../assets/profile-dummy.webp";
import Loading from "../spinner/Loading";
import { useNotification } from "../../context/NotificationContext ";

function UserProfileSideBar() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { clearUserNotifications } = useNotification();

  const handleLogout = () => {
    dispatch(logoutUser());
    clearUserNotifications();
    navigate("/login");
  };

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchUserDetails = async () => {
      try {
        const response = await userAxiosInstance.get(
          `/api/user/users/${userInfo.id}`
        );
        setPreview(response.data.image);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };

    fetchUserDetails();
  }, [userInfo?.id]);

  const handleImageUpdate = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedImage.type)) {
      toast.error(
        "Invalid file type. Please select a JPEG, PNG, or GIF image."
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (selectedImage.size > maxSize) {
      toast.error(
        "File size is too large. Please select an image smaller than 5MB."
      );
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("profileImage", selectedImage);

    try {
      const response = await userAxiosInstance.patch(
        `/api/user/profile-image/${userInfo?.id}`,
        formData
      );
      if (response.status === 200) {
        toast.success("Profile uploaded successfully");
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload profile image");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`lg:flex lg:flex-col lg:w-[20%] xl:w-[100%] h-[75vh] mt-24 bg-blue-500 shadow-lg transition-transform duration-300 ease-in-out transform ${
        !preview && "flex-grow"
      }`}
    >
      <nav className="flex flex-col space-y-4 w-full">
        <div className="flex justify-center mt-6">
          <div className="relative">
            <img
              src={preview || profileDummy}
              alt="profile"
              className="h-32 w-32 object-cover rounded-full bg-black"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loading />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-3 gap-4">
          {!selectedImage ? (
            <>
              <label
                htmlFor="profileImage"
                className="text-white cursor-pointer hover:bg-gray-700 bg-black rounded-xl px-4 py-2 transition duration-200"
              >
                Update Photo
              </label>
              <input
                id="profileImage"
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={handleImageUpdate}
                className="text-white bg-gray-700 hover:bg-gray-800 rounded-xl px-4 py-2 transition duration-200"
              >
                Upload
              </button>

              <label
                htmlFor="profileImage"
                className="text-white bg-gray-500 hover:bg-gray-600 rounded-xl px-4 py-2 cursor-pointer transition duration-200"
              >
                Upload Again
              </label>
              <input
                id="profileImage"
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="w-full flex flex-col space-y-2 mt-4">
          <Link
            to="/profile"
            className={`flex items-center pl-6 p-2 ${
              isActive("/profile")
                ? "bg-gray-700 text-white"
                : "text-white hover:bg-gray-700 hover:text-gray-300"
            } rounded-md transition`}
          >
            <span>Profile</span>
          </Link>
          <Link
            to="/profile/sessions"
            className={`flex items-center pl-6 p-2 ${
              isActive("/profile/sessions")
                ? "bg-gray-700 text-white"
                : "text-white hover:bg-gray-700 hover:text-gray-300"
            } rounded-md transition`}
          >
            <span>Sessions</span>
          </Link>
          <Link
            to="/profile/bookings"
            className={`flex items-center pl-6 p-2 ${
              isActive("/profile/bookings")
                ? "bg-gray-700 text-white"
                : "text-white hover:bg-gray-700 hover:text-gray-300"
            } rounded-md transition`}
          >
            <span>Bookings</span>
          </Link>
          <Link
            to="/profile/message"
            className={`flex items-center pl-6 p-2 ${
              isActive("/profile/message")
                ? "bg-gray-700 text-white"
                : "text-white hover:bg-gray-700 hover:text-gray-300"
            } rounded-md transition`}
          >
            <span>Message</span>
          </Link>

          <div
            onClick={handleLogout}
            className="flex items-center pl-6 p-2 text-white hover:bg-gray-700 hover:text-gray-300 rounded-md transition cursor-pointer"
          >
            <span>Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default UserProfileSideBar;
