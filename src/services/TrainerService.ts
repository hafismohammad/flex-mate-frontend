import axiosInstance from "../../axios/trainerAxiosInstance";

const getAllSpecializations = async () => {
  try {
    const response = await axiosInstance.get(`/api/trainer/specializations`);
    return response.data;
    
  } catch (error: any) {
    console.error(
      "Error fetching specializations:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export interface ITrainer {
  trainerId?: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  specializations: string[];
  isBlocked?: boolean;
}

const registerTrainer = async (trainerData: ITrainer) => {
  try {
    const response = await axiosInstance.post(
      `/api/trainer/signup`,
      trainerData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error registering trainer:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const verifyOtp = async ({
  trainerData,
  otp,
}: {
  trainerData: ITrainer;
  otp: string;
}) => {
  try {
    const response = await axiosInstance.post(`/api/trainer/otp`, {
      trainerData,
      otp,
    });
    if (response.data) {
      localStorage.setItem("trainer", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error: any) {
    console.error(
      "Error verifying OTP:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const trainerLogin = async (trainerData: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axiosInstance.post(
      `/api/trainer/login`,
      trainerData,
      { withCredentials: true }
    );
    console.log("Trainer login successful:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error during trainer login:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const kycSubmission = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post(`/api/trainer/trainers/kyc`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error kyc submission trainer:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const logoutTrainer = async () => {
  try {
    const response = await axiosInstance.post(`/api/trainer/logout`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error during trainer logout:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const kycStatus = async (trainer_id: string) => {
  try {
    const response = await axiosInstance.get(
      `/api/trainer/kycStatus/${trainer_id}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error during KYC status fetching:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const trainerService = {
  getAllSpecializations,
  registerTrainer,
  verifyOtp,
  trainerLogin,
  kycSubmission,
  logoutTrainer,
  kycStatus,
};

export default trainerService;
