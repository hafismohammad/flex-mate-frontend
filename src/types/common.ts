export interface ISessionSchedule {
  _id: string;
  specializationId: Specialization; 
  isSingleSession: boolean;
  startDate: string; 
  endDate: string; 
  startTime: string;
  endTime: string;
  price: number;
  duration?: string; 
  isBooked: boolean;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'InProgress'; 
  trainerId: string;
}

export interface Specialization {
  _id: string;
  name: string;
  description: string;
  image: string;
  isListed: boolean;
}


export interface IBookingDetails {
  _id: string
  userName: string
  userId?:string
  trainerName: string
  bookingDate: string;
  sessionDates: {
    startDate: string; 
    endDate?: string;  
  };
  sessionStartTime: string;
  sessionEndTime: string;
  sessionType: string;
  specialization: string
  amount: string
  status: string
}


interface userId {
  image: string
  name: string
}

export interface IVideoCall extends Document {
  trainerId: string
  userId?:userId
  roomId: string;
  startedAt: Date;
  duration: number; // in seconds
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainerId {
  profileImage: string;
  name: string;
}

export interface IVideoCallUser extends Document {
  trainerId: TrainerId; // Changed from string to TrainerId object
  userId?: string; // Assuming userId can be a string
  roomId: string;
  startedAt: Date;
  duration: number; // in seconds
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}



export interface IReview {
  review_id: string
  comment: string
  rating: number
  userName: string
  userImage: string
  userId : string
}

export interface AvgRatingAndReviews {
  totalReviews: number;
  averageRating: number;
}

