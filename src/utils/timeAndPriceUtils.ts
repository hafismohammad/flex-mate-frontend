
export const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes < 10 ? "0" : ""}${minutes} ${period}`;
  };


  export const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
  
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
  
    return `${hours} hrs ${minutes} mins`;
  };

 
  export const formatPriceToINR = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
    if (isNaN(numericAmount)) {
      return 'Invalid Amount'; 
    }
  
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numericAmount);
  };

 export const numberOfSessions = (startDate: string, endDate: string) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dayOne = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const dayTwo = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    
    const diffMs = Math.abs(dayOne - dayTwo);
    return Math.round((diffMs / oneDay) +1);
};

  
  