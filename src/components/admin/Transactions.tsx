import { useEffect, useState } from "react";
import adminAxiosInstance from "../../../axios/adminAxiosInstance";
import { IBookingDetails } from "../../types/common";
import { formatPriceToINR } from "../../utils/timeAndPriceUtils";

function Transactions() {
  const [bookingDetails, setBookingDetails] = useState<IBookingDetails[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState< IBookingDetails[] >([]);
  const [filter, setFilter] = useState<"all" | "credit" | "paid" | "refund">("all" );
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const transactionsPerPage = 10;

  const calculateDepreciation = (amount: number) => {
    const depreciation = amount * 0.1;
    return amount - depreciation;
  };

  const fetchBookingDetails = async () => {
    try {
      const response = await adminAxiosInstance.get(`/api/admin/bookings`);
      setBookingDetails(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  };

  const applyFilter = () => {
    let filtered = bookingDetails;

    if (filter !== "all") {
      filtered = bookingDetails.filter((booking) => {
        if (filter === "credit" && booking.status === "Confirmed") return true;
        if (filter === "paid" && booking.status === "Completed") return true;
        if (filter === "refund" && booking.status === "Cancelled") return true;
        return false;
      });
    }

    if (startDate && endDate) {
      filtered = filterByDate(filtered);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const filterByDate = (transactions: IBookingDetails[]) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactions.filter((transaction) => {
      const bookingDate = new Date(transaction.bookingDate);
      return bookingDate >= start && bookingDate <= end;
    });
  };

  const handleDateSearch = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    applyFilter();
  };

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, startDate, endDate]);

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Pagination handlers
  const nextPage = () => setCurrentPage(currentPage + 1);
  const prevPage = () => setCurrentPage(currentPage - 1);

  return (
    <div>
      <div className="flex justify-around mt-5">
        <div className="flex items-center gap-5">
          {["all", "credit", "paid", "refund"].map((type) => (
            <button
              key={type}
              onClick={() =>
                setFilter(type as "all" | "credit" | "paid" | "refund")
              }
              className={`py-1 px-3 rounded-sm shadow-md ${
                filter === type
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded-md"
          />
          <button
            onClick={handleDateSearch}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-100 mt-4 mb-5">
        <div className="h-auto w-[90%] bg-white p-5 shadow-lg">
          <table className="table-auto w-full text-center">
            <thead>
              <tr>
                <th className="px-4 py-2">Booking ID</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Amount After Depreciation</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-4 py-2">{booking._id}</td>
                  <td className="px-4 py-2">
                    {formatPriceToINR(booking.amount)}
                  </td>
                  <td className="px-4 py-2">
                    {formatPriceToINR(
                      calculateDepreciation(Number(booking.amount))
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of{" "}
              {Math.ceil(filteredTransactions.length / transactionsPerPage)}
            </span>
            <button
              onClick={nextPage}
              disabled={
                currentPage ===
                Math.ceil(filteredTransactions.length / transactionsPerPage)
              }
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
