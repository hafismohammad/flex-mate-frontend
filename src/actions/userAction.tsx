import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../features/user/userTypes";
import userService from "../services/userServices";

interface RegisterErrorPayload {
  status: number;
  message: string;
}
export const registerUser = createAsyncThunk<
  any, // The type of the resolved value (response from the API)
  User, // The type of the argument (user data sent)
  { rejectValue: RegisterErrorPayload } 
>(
  "user/signup",
  async (userDetails: User, thunkAPI) => {
    try {
      const response = await userService.register(userDetails);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        console.log("Email already exists", error.response);
        return thunkAPI.rejectWithValue({ status: 409, message: 'Email already exists' });
      }
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);


interface VerifyOtpArgs {
  userData: User; 
  otp: string;
}

export const verifyOtp = createAsyncThunk(
  "user/otp",
  async ({ userData, otp }: VerifyOtpArgs, thunkAPI) => {
    try {
      const response = await userService.verifyOtp({ userData, otp });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

interface loginUser {
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: loginUser, thunkAPI) => {
    try {
      const response = await userService.login({ email, password });
      console.log('user login response data', response.data);  
      return response.data; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, thunkAPI) => {
    try {
      const response = await userService.logout();
      console.log('logout response', response);
      return response.data; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data); 
    }
  }
)

