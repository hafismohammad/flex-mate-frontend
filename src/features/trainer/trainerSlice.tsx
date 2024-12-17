import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSpecializations,
  registerTrainer,
  trainerVerifyOtp,
  loginTrainer,
  logoutTrainer,
  getKycStatus,
  submitKyc
} from "../../actions/trainerAction";

interface Notification {
  content: string;
  read: boolean;
  createdAt: string;
}

interface TrainerState {
  trainerInfo: null | any;
  trainerToken: null | string;
  specializations: any[];
  kycStatus: string;
  loading: boolean;
  rejectionReason: null | string;
  error: null | string;
  videoCall:  VideoCallPayload | null;
  showVideoCallTrainer: boolean
  roomIdTrainer: null | string
  showPrescription: boolean
  notificationTrainer: Notification[];
}

interface VideoCallPayload {
  userID: string;
  type: string;
  callType: string;
  roomId: string;
  userName: string
  userImage: string;
  trainerName: string;
  trainerImage: string;
  bookingId: string
}

const trainer = localStorage.getItem("trainer");
const parsedTrainer = trainer ? JSON.parse(trainer) : null;

const initialState: TrainerState = {
  trainerInfo: parsedTrainer,
  trainerToken: localStorage.getItem("trainer_access_token") || null,
  specializations: [],
  kycStatus: "pending",
  rejectionReason: null,
  loading: false,
  error: null,
  videoCall: null,
  showVideoCallTrainer: false,
  roomIdTrainer: null,
  showPrescription: false,
  notificationTrainer: []
};

const trainerSlice = createSlice({
  name: "trainer",
  initialState,
  reducers: {
    clearTrainer(state) {
      state.trainerInfo = null;
      state.trainerToken = null;
      state.specializations = [];
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setVideoCall(state, action: PayloadAction<VideoCallPayload  | null>) {
      state.videoCall = action.payload;
      console.log('hit vidocall slice', state.videoCall);
      
    },
    setShowVideoCall(state, action: PayloadAction<boolean>) {
      state.showVideoCallTrainer = action.payload;
      console.log('showVideoCallTrainer slice', state.showVideoCallTrainer);

    },
    setRoomId(state, action: PayloadAction<string | null>) {
      state.roomIdTrainer = action.payload;
      console.log('roomIdTrainer slice', state.roomIdTrainer);
      
    },
    setNotificactionTrainer(state, action: PayloadAction<Notification[]>) {
      state.notificationTrainer = [...state.notificationTrainer, ...action.payload];
      console.log('action',action.payload);
      
      console.log("notificationTrainer slice", state.notificationTrainer);
    },
    
    setPrescription(state, action: PayloadAction<boolean>) {
      state.showPrescription = action.payload
    },
    endCallTrainer: (state) => {
      state.videoCall = null;
      state.showVideoCallTrainer = false; 
      state.roomIdTrainer = null;   
      localStorage.removeItem("IncomingVideoCall"); 
    },
  
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecializations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSpecializations.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.specializations = action.payload;
        }
      )
      .addCase(fetchSpecializations.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // console.log('-------------------',action.payload);
        state.error = action.payload?.message || "Failed to fetch specializations";
      })

      .addCase(registerTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTrainer.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.trainerInfo = action.payload;
        
        state.error = null; 
      })
      .addCase(registerTrainer.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error =  action.payload || "Registration failed"
        console.log('acion',action.payload);
      })  
      
      // Verify OTP actions
      .addCase(trainerVerifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trainerVerifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.trainerInfo = action.payload;
        state.error = null;
      })
      .addCase(trainerVerifyOtp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })

      // Login trainer actions
      .addCase(loginTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginTrainer.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.trainerInfo = action.payload.trainer;
        state.trainerToken = action.payload.token;
        localStorage.setItem("trainer", JSON.stringify(action.payload.trainer));
        localStorage.setItem("trainer_access_token", action.payload.token);
      })
      .addCase(loginTrainer.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Logout trainer
      .addCase(logoutTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutTrainer.fulfilled, (state) => {
        state.loading = false;
        state.trainerInfo = null;
        state.trainerToken = null;
        localStorage.removeItem("trainer");
        localStorage.removeItem("trainer_access_token");
      })
      // kyc status update
      .addCase(getKycStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKycStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.kycStatus = action.payload.kycStatus;
        console.log('get kyc',action.payload.kycStatus);
        
        state.error = null;
      })
      .addCase(getKycStatus.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })

      // kuc submit then change kycStatus to submited
      .addCase(submitKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitKyc.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.kycStatus = action.payload.kycStatus;
        console.log('submitt kyc',action.payload.kycStatus);
        
        state.error = null;
      })
      .addCase(submitKyc.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })
  },
});

// Export the actions and reducer
export const { clearTrainer, setError, setLoading, setVideoCall, setShowVideoCall, setRoomId, endCallTrainer, setPrescription, setNotificactionTrainer } = trainerSlice.actions;
export default trainerSlice.reducer;
