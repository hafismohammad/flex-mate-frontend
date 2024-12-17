import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useEffect, useState } from "react";
import axiosInstance from "../../../axios/trainerAxiosInstance";
import { formatPriceToINR } from "../../utils/timeAndPriceUtils";
import { IWallet } from "../../types/trainer";
import toast, { Toaster } from "react-hot-toast";

function Wallet() {
  const [walletData, setWalletData] = useState<IWallet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawMoney, setWithdrawMoney] = useState<{ amount: string | null }>({ amount: null });
  const transactionsPerPage = 5; // Number of transactions per page
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all"); // Filter state
  const { trainerInfo } = useSelector((state: RootState) => state.trainer);

  useEffect(() => {
    const fetchWalletData = async () => {
      const response = await axiosInstance.get(`/api/trainer/wallet-data/${trainerInfo.id}`);
      setWalletData(response.data);
    };
    fetchWalletData();
  }, [trainerInfo.id]);

  // Filter transactions
  const filteredTransactions = walletData?.transactions.filter((transaction) => {
    if (filter === "all") return true; // Include all transactions for "All"
    return transaction.transactionType === filter; // Include only matching transactions for "Credit" or "Debit"
  });

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions?.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const nextPage = () => {
    if (currentPage < Math.ceil((filteredTransactions?.length || 0) / transactionsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleWithdrawButton = () => {
    setIsModalOpen(true);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

  
    const amount = withdrawMoney.amount ?? ""; // Default to an empty string if null
    if (!amount || parseFloat(amount) <= 0) {
      toast("Please enter a valid amount to withdraw.");
      return;
    }
  
    try {
      const response = await axiosInstance.post(`/api/trainer/withdraw/${trainerInfo.id}`, {
        amount: parseFloat(amount), 
      });
  
      if (response.status === 200) {
        toast.success("Money withdrawal successfully.");
  
        setWalletData((prev) =>
          prev
            ? {
                ...prev,
                balance: prev.balance - parseFloat(amount),
                transactions: [
                  ...prev.transactions,
                  {
                    transactionId: `txn_${Date.now()}`,
                    amount: parseFloat(amount),
                    transactionType: "debit",
                    date: new Date(),
                  },
                ],
              }
            : null
        );
  
        setIsModalOpen(false);
        setWithdrawMoney({amount: null})
      } else {
        alert("Withdrawal request failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };
  
  

  const toggleModal = () => {
    setWithdrawMoney({amount: null})
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className="flex items-center justify-center bg-gray-100 mt-4 mb-5">
        <Toaster />
        <div className="h-[20vh] w-[90%] bg-white p-5 shadow-lg">
          <div className="flex justify-between p-8">
            <h1 className="text-2xl font-bold">
              Available Balance: {formatPriceToINR(walletData?.balance ?? 0)}
            </h1>
            <button
              onClick={handleWithdrawButton}
              className="py-2 px-3 font-medium text-white bg-blue-500 hover:bg-blue-700"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex justify-end gap-5">
          {["all", "credit", "debit"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilter(type as "all" | "credit" | "debit");
                setCurrentPage(1); 
              }}
              className={`py-1 px-3 rounded-sm shadow-md ${
                filter === type ? "bg-blue-500 text-white" : "bg-white text-black"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-100 mt-4 mb-5">
        <div className="h-auto w-[90%] bg-white p-5 shadow-lg">
          {currentTransactions && currentTransactions.length > 0 ? (
            <table className="table-auto w-full text-center">
              <thead>
                <tr>
                  <th className="px-4 py-2">Transaction ID</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.transactionId}>
                    <td className="px-4 py-2">{transaction.transactionId}</td>
                    <td className="px-4 py-2">{formatPriceToINR(transaction.amount)}</td>
                    <td className="px-4 py-2">{transaction.transactionType}</td>
                    <td className="px-4 py-2">
                      {transaction.date
                        ? new Date(transaction.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No transactions found.</p>
          )}
        </div>
      </div>

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
          {Math.ceil((filteredTransactions?.length || 0) / transactionsPerPage)}
        </span>
        <button
          onClick={nextPage}
          disabled={
            currentPage ===
            Math.ceil((filteredTransactions?.length || 0) / transactionsPerPage)
          }
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Withdraw Money</h2>
            <form onSubmit={handleWithdraw}>
              <input
                type="number"
                value={withdrawMoney.amount ?? ""}
                onChange={(e) => setWithdrawMoney({ amount: e.target.value })}
                placeholder="Enter amount"
                className="border rounded-lg p-2 w-full mb-4"
                required
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Wallet;
