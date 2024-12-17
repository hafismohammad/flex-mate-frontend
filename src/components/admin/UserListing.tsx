import React, { useEffect, useState } from "react";
import adminAxiosInstance from "../../../axios/adminAxiosInstance";
import { User } from "../../types/user";

function UserListing() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAxiosInstance.get(`/api/admin/users`);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter((user) =>
    user._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUnblock = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await adminAxiosInstance.patch(
        `/api/admin/users/${userId}/block-unblock`,
        { status: !currentStatus }
      );
      
      if (response.status === 200 && response.data && response.data.data) {
        const updatedUserStatus = response.data.data.isBlocked;

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: updatedUserStatus } : user
          )
        );
      } else {
        console.error("Failed to update user status on the server.");
      }
    } catch (error) {
      console.error("Error occurred while updating user status:", error);
    }
  };

  const handleView = (user: User) => {
    
    setSelectedUser(user); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null); 
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-gray-800">User List</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search Users"
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

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-7 items-center p-4 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-none mb-2"
            >
              <div className="text-gray-800 font-medium">
                {user._id.toUpperCase().substring(0, 8)}
              </div>
              <div className="text-gray-800 font-medium">{user.name}</div>
              <div className="text-gray-800 font-medium truncate">{user.email}</div>
              <div className="text-gray-800 font-medium">{user.phone}</div>
              <div className={`${user.isBlocked ? "font-medium text-red-500" : "font-medium text-green-500"}`}>
                {user.isBlocked ? "Blocked" : "Active"}
              </div>
              <div className="col-span-2 flex justify-center space-x-4">
                <button
                  onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                  className={`text-white py-2 px-5 rounded-md ${
                    user.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"
                  }`}
                  style={{ minWidth: "100px" }}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
                <button
                  onClick={() => handleView(user)}
                  className="text-white py-2 px-5 rounded-md bg-blue-500 hover:bg-blue-600"
                  style={{ minWidth: "100px" }}
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-6">No user found.</div>
        )}
      </div>

      {isModalOpen && selectedUser && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
       <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-2xl shadow-lg h-[85vh] overflow-y-auto relative">
         <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
           Close
         </button>
          <div className="flex justify-center">
            <img src={selectedUser.image} alt="profile" className="w-40 h-40 rounded-full object-cover" />
          </div>
         <div className="mt-5 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
           <div>
             <label className="block mb-1 font-medium text-gray-700">Name</label>
             <div className="border border-gray-500 p-2 rounded-md">
               <h1 className="text-gray-800">{selectedUser.name}</h1>
             </div>
           </div>
           <div>
             <label className="block mb-1 font-medium text-gray-700">Email</label>
             <div className="border border-gray-500 p-2 rounded-md">
               <h1 className="text-gray-800">{selectedUser.email}</h1>
             </div>
           </div>
           <div>
             <label className="block mb-1 font-medium text-gray-700">Phone</label>
             <div className="border border-gray-500 p-2 rounded-md">
               <h1 className="text-gray-800">{selectedUser.phone}</h1>
             </div>
           </div>
           <div>
             <label className="block mb-1 font-medium text-gray-700">Date of Birth</label>
             <div className="border border-gray-500 p-2 rounded-md">
               <h1 className="text-gray-800">{selectedUser.dob || 'Not Specified'}</h1>
             </div>
           </div>
           <div>
             <label className="block mb-1 font-medium text-gray-700">Gender</label>
             <div className="border border-gray-500 p-2 rounded-md">
               <h1 className="text-gray-800">{selectedUser.gender || 'Not Specified'}</h1>
             </div>
           </div>
           <div>
             <label className="block mb-1 font-medium text-gray-700">Status</label>
             <div className="border border-gray-500 p-2 rounded-md">
               <h1 className="text-gray-800">{selectedUser.isBlocked ? "Blocked" : "Active"}</h1>
             </div>
           </div>
         </div>
       </div>
     </div>
     
      )}
    </div>
  );
}

export default UserListing;
