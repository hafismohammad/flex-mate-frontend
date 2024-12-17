

export interface KycDocument {
    type: string;
    file: File | null; 
  }
  
  export interface KycSubmission {
    pinCode: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    comment: string;
    documents: KycDocument[]; 
  }
  

   export interface ITrainerKycData {
    trainer_id: string;
    specialization: string;
    name: string;
    email: string;
    phone: string;
    profileImage: File | null;
    aadhaarFrontSide: File | null;
    aadhaarBackSide: File | null;
    certificate: File | null;
  }


  export interface Specialization {
    _id: string;
    name: string;
    description: string;
    isListed: boolean
  }
  
  export interface Trainer {
    _id: string; 
    profileImage: string
    name: string; 
    email: string; 
    phone: number; 
    gender: string;
    language: string
    yearsOfExperience: string
    specializations: Specialization[]
    dailySessionLimit: number
    isBlocked: boolean; 
  }

  export interface TrainerProfile {
    _id: string;
    name: string;
    email: string;
    phone: number;
    profileImage: string;
    specializations: Specialization[];
    imageUrl?: string;
    yearsOfExperience?: string | null
    about: string
    language?: string | null
    gender?: string | null
    isBlocked: boolean;
    kycStatus: string;
  }
  

  export interface ISessionSchedule {
    _id: string;
    isSingleSession: boolean;
    startDate: string; 
    endDate: string; 
    startTime: string;
    endTime: string;
    price: number;
    specializationId: Specialization
    duration?: string; 
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'InProgress'; 
    trainerId: string;
  }
  

  export interface ISpec  {
    _id: string;
    name: string;
    description: string;
    image: string;
    isListed: boolean;
  }



  export interface ITransaction {
    amount: number;
    transactionId: string;
    transactionType: 'credit' | 'debit';
    date?: Date;
    bookingId?: string;
  }
  
  export interface IWallet {
    trainerId: string;
    balance: number;
    transactions: ITransaction[];
    createdAt?: Date;
    updatedAt: Date;
  }