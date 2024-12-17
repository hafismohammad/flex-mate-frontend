import { User } from "../features/user/userTypes";
import API_URL from '../../axios/API_URL'; 
import userAxiosInstance from "../../axios/userAxionInstance";

const register = async (userDetails: User) => {
  const response = await userAxiosInstance.post(`${API_URL}/api/user/signup`, userDetails);

  if (response.data) {
    console.log('register', response.data);
  }

  return response.data;
};

const login = async (userData: { email: string; password: string }) => {
  const response = await userAxiosInstance.post(`${API_URL}/api/user/login`, userData);
  return response;
};

const verifyOtp = async ({
  userData,
  otp,
}: {
  userData: User;
  otp: string;
}) => {
  const response = await userAxiosInstance.post(`${API_URL}/api/user/verifyotp`, { userData, otp });

  if (response.data) {
    // Store the user data in localStorage after successful OTP verification
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

const logout = () => {
  return userAxiosInstance.post(`${API_URL}/api/user/logout`, {});
}

const userService = {
  register,
  verifyOtp,
  login,
  logout
};

export default userService;
