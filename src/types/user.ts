
export interface User {
  _id: string;
  image: string
  name: string;
  email: string;
  phone: number;
  dob: string,
  gender: string
  isBlocked: boolean;
}

export interface IBookedSession {
  _id: string
  trainerId: string
  bookingId: string
  trainerImage: string;
  trainerName: string;
  specialization: string;
  sessionDates: {
    startDate: string; 
    endDate?: string;  
  };
  startTime: string;
  endTime: string;
  sessionType: string;
  bookingStatus: string
}
