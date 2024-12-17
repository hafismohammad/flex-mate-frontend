import React, { useEffect, useState } from "react";
import adminAxiosInstance from "../../../axios/adminAxiosInstance";
import { Trainer } from "../../types/trainer";




function TrainerListing() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null) 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAxiosInstance.get(`/api/admin/trainers`);
        setTrainers(response.data.trainer);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };
    fetchData();
  }, []);

  const filteredTrainers = trainers.filter((trainer) =>
    trainer._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUnblock = async (trainerId: string, currentStatus: boolean) => {
    try {
        
      const response = await adminAxiosInstance.patch(
        `/api/admin/trainers/${trainerId}/block-unblock`,
        { status: !currentStatus }
      );
      
  
      if (response.status === 200 && response.data && response.data.data) {
        const updatedTrainerStatus = response.data.data.isBlocked;
  
        setTrainers((prevTrainers) =>
          prevTrainers.map((trainer) =>
            trainer._id === trainerId ? { ...trainer, isBlocked: updatedTrainerStatus } : trainer
          )
        );
      } else {
        console.error('Failed to update trainer status on the server.');
      }
    } catch (error) {
      console.error('Error occurred while updating trainer status:', error);
    }
  };


  const handleView = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-gray-800">Trainer List</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search Trainers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-7 gap-1 text-lg font-semibold text-gray-600 mb-4 border-b border-gray-200 pb-2">
          <div>ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {filteredTrainers.length > 0 ? (
          filteredTrainers.map((trainer) => (
            <div 
              key={trainer._id} 
              className="grid grid-cols-7 items-center p-4 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-none mb-2"
            >
              <div className="text-gray-800 font-medium">{trainer._id.toUpperCase().substring(0, 8)}</div>
              <div className="text-gray-800 font-medium">{trainer.name}</div>
              <div className="text-gray-800 font-medium truncate">{trainer.email}</div>
              <div className="text-gray-800 font-medium">{trainer.phone}</div>
              <div className={`${trainer.isBlocked ? 'font-medium text-red-500': 'font-medium text-green-500' }`}> 
                {trainer.isBlocked ? "Blocked" : "Active"}
              </div>
              <div className="col-span-2 flex justify-center space-x-4">
                <button
                  onClick={() => handleBlockUnblock(trainer._id, trainer.isBlocked)} 
                  className={`text-white py-2 px-5 rounded-md ${trainer.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600' }`}  
                  style={{ minWidth: "100px" }} 
                >
                  {trainer.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button 
                onClick={() => handleView(trainer)}
                  className="text-white py-2 px-5 rounded-md bg-blue-500 hover:bg-blue-600"  
                  style={{ minWidth: "100px" }}
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-6">No trainers found.</div>
        )}
      </div>

       {isModalOpen && selectedTrainer && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-2xl shadow-lg h-[95vh] overflow-y-auto relative">
         <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
           Close
         </button>
         <div className="flex justify-center">
          <img src={selectedTrainer.profileImage} alt="profile" className="w-40 h-40 rounded-full object-cover" />
         </div>
         <div className="mt-5 w-full max-w-4xl grid grid-cols-1  md:grid-cols-2 gap-6 p-8">
       <div>
       <label className="block mb-1 font-medium text-gray-700">Name</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.name}</h1>
        </div>
       </div>
       <div>
       <label className="block mb-1 font-medium text-gray-700">Email</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.email}</h1>
        </div>
       </div> <div>
       <label className="block mb-1 font-medium text-gray-700">Phone</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.phone}</h1>
        </div>
       </div> <div>
       <label className="block mb-1 font-medium text-gray-700">Gender</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.gender || 'Not Specified'}</h1>
        </div>
       </div> <div>
       <label className="block mb-1 font-medium text-gray-700">Language</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.language || 'Not Specified'}</h1>
        </div>
       </div> <div>
       <label className="block mb-1 font-medium text-gray-700">Year of experience</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.yearsOfExperience || 'Not Specified'}</h1>
        </div>
       </div> <div>
       <label className="block mb-1 font-medium text-gray-700">Specialization</label>
<div className="border border-gray-500 p-2 rounded-md">
  {selectedTrainer.specializations?.map((spec, index) => (
    <h1 key={index}>{spec.name}</h1>
  ))}
</div>

       </div> <div>
       <label className="block mb-1 font-medium text-gray-700">Daily session limit</label>
        <div className="border border-gray-500 p-2 rounded-md">
          <h1>{selectedTrainer.dailySessionLimit || 'Not Specified'}</h1>
        </div>
       </div>
         </div>
         </div>
       </div>
       )}

    </div>
  );
}

export default TrainerListing;
