import { Routes, Route } from "react-router-dom";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminLayout from "../components/admin/AdminLayout ";
import Verification from "../components/admin/Verification";
import SpecializationsPage from "../pages/admin/SpecializationsPage";
import TrianerVerificationViewPage from "../pages/admin/TrianerVerificationViewPage";
import UserListingPage from "../pages/admin/UserListingPage";
import TrainerListingPage from "../pages/admin/TrainerListingPage";
import Bookings from "../components/admin/Bookings";
import TransactionsPage from "../pages/admin/TransactionsPage";

function AdminRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/specializations" element={<SpecializationsPage />} />
          <Route path="/trainer-view/:trainerId" element={<TrianerVerificationViewPage />} />
          <Route path="/user-listing" element={<UserListingPage />}/>
          <Route path="/trainer-listing" element={<TrainerListingPage />}/>
          <Route path="/bookings" element={<Bookings />}/>
          {/* <Route path="/transactions" element={<TransactionsPage />}/> */}
        </Route>
      </Routes>
    </div>
  );
}

export default AdminRoutes;
