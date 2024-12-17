import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState, User } from "./userTypes";
import { registerUser, verifyOtp, loginUser, logoutUser } from "../../actions/userAction";

// Initial state
const user = localStorage.getItem("user");

const final = user ? JSON.parse(user) : null;

const initialState: UserState = {
  userInfo: final?final : null,
  token: localStorage.getItem("access_token") || null,
  loading: false,
  error: null,
  showIncomingVideoCall: {
    _id: "",
    callType: "",
    trainerName: "",
    trainerImage: '',
    roomId: null,
  },
  videoCall: null,
  showVideoCallUser: false,
  roomIdUser: null,
  
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser(state) {
      state.userInfo = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setShowIncomingVideoCall: (state, action) => {
      state.showIncomingVideoCall = action.payload
// console.log('userslcie', state.showIncomingVideoCall);

      
    },
    setVideoCallUser(state, action: PayloadAction<string | null>) {
      state.videoCall = action.payload;
    },
    setShowVideoCallUser(state, action: PayloadAction<boolean>) {
      state.showVideoCallUser = action.payload;
    },
    setRoomIdUser(state, action: PayloadAction<string | null>) {
      state.roomIdUser = action.payload;
    },
    endCallUser: (state) => {
      console.log('hit  user sclice-------->');
      
      state.videoCall = null;
      state.showIncomingVideoCall = null;
      state.showVideoCallUser = false; // Ensure the video call state is false
      state.roomIdUser = null;         // Clear the room ID if necessary
      console.log('callend user slice',state.showIncomingVideoCall);
      localStorage.removeItem("IncomingVideoCall");
    },
    
  },
  extraReducers: (builder) => {
    builder
      // Register user actions
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP actions
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login user actions
      .addCase(loginUser.pending, (state, action: PayloadAction<any>) => {
        state.loading = true;
        state.error = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.user;
        state.token = action.payload.token;
        // console.log(action.payload.user);
        
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("access_token", action.payload.token);
        console.log('user slice is workind ', action.payload);
        
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

       // Logout user
      .addCase(logoutUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.userInfo = null;
        state.error = null;
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
      })

  },
});

// Export actions and reducer
export const { clearUser, setLoading, setError, setVideoCallUser, setShowVideoCallUser, setRoomIdUser, setShowIncomingVideoCall, endCallUser } = userSlice.actions;
export default userSlice.reducer;
