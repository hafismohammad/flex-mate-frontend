// SessionModal.tsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSingleSession: boolean;
  setIsSingleSession: (value: boolean) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  price: string;
  setPrice: (value: string) => void;
  setRecurrenceOption: (value: string) => void;
  handleAdd: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  isSingleSession,
  setIsSingleSession,
  selectedDate,
  setSelectedDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  price,
  setPrice,
  handleAdd,
  setRecurrenceOption,
}) => {
  const clearSessionData = () => {
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
    setStartTime("");
    setEndTime("");
    setPrice("");
  };

  const handleSingleSession = () => {
    setIsSingleSession(true);
    clearSessionData();
  };

  const handlePackageSession = () => {
    setIsSingleSession(false);
    clearSessionData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 h-[95vh] w-full max-w-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Choose Session Type</h3>
        <div className="mt-8 space-x-4">
          <button
            onClick={handleSingleSession}
            className={`p-2 ${
              isSingleSession
                ? "bg-blue-500 text-white"
                : "bg-slate-400 text-white"
            } rounded-md`}
          >
            Single Session
          </button>
          <button
            onClick={handlePackageSession}
            className={`p-2 ${
              !isSingleSession
                ? "bg-blue-500 text-white"
                : "bg-slate-400 text-white"
            } rounded-md`}
          >
            Package Session
          </button>
        </div>

        <form onSubmit={handleAdd}>
          <div className="bg-slate-200 p-10 mt-7 rounded-lg">
            {isSingleSession ? (
              <>
               <div className="flex">
              <div>
              <label className="block text-gray-700 mb-2">Select Date</label>
                <DatePicker
                  maxDate={
                    new Date(new Date().setDate(new Date().getDate() + 20))
                  }
                  minDate={new Date()}
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholderText="Select date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  required
                />
              </div>
              <div className="max-w-sm mx-auto mt-1">
                  <label
                    htmlFor="countries"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                     Select Recurrence Option
                  </label>
                  <select
                    onChange={(e) => setRecurrenceOption(e.target.value)}
                    id="countries"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="oneDay">Single Day</option>
                    <option value="oneWeek">1 Week (Daily)</option>
                    <option value="twoWeek">2 Weeks (Daily)</option>
                  </select>
                </div>

               </div>
                <label className="block text-gray-700 mb-2 mt-4">
                  Select Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
                <label className="block text-gray-700 mb-2 mt-4">
                  Select End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
                <label className="block text-gray-700 mt-4">
                  Session Price
                </label>
                <input
                  onChange={(e) =>
                    setPrice(e.target.value.replace(/[^\d.]/g, ""))
                  }
                  value={`₹ ${price}`}
                  className="px-3 py-3 mt-3 rounded-lg w-full"
                  type="text"
                  placeholder="Enter Session Price"
                  required
                />
              </>
            ) : (
              <>
                <label className="block text-gray-700 mb-2">Start Date</label>
                <DatePicker
                  maxDate={
                    new Date(new Date().setDate(new Date().getDate() + 20))
                  }
                  minDate={new Date()}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Select start date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
                <label className="block text-gray-700 mb-2 mt-4">
                  End Date
                </label>
                <DatePicker
                  maxDate={
                    new Date(new Date().setDate(new Date().getDate() + 20))
                  }
                  minDate={new Date()}
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="Select end date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
                <div className="flex justify-around">
                  <label className="block text-gray-700 mb-2 mt-4">
                    Select Start Time
                  </label>
                  <label className="block text-gray-700 mb-2 mt-4">
                    Select End Time
                  </label>
                </div>
                <div className="flex justify-around gap-7">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                <label className="block text-gray-700 mt-4">
                  Package Price
                </label>
                <input
                  onChange={(e) =>
                    setPrice(e.target.value.replace(/[^\d]/g, ""))
                  }
                  value={`₹ ${price}`}
                  className="px-3 py-3 mt-3 rounded-lg w-full"
                  type="text"
                  placeholder="Enter Package Price"
                  required
                />
              </>
            )}
            <div className="mt-7 flex justify-center">
              <button
                type="submit"
                className="text-white px-9 rounded-lg py-3 bg-blue-500 hover:bg-blue-700 mr-6"
              >
                Add
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-white px-7 rounded-lg py-3 bg-red-500 hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
