import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import { useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import Spare from "./pages/Spare";
import HistoryTransaction from "./pages/HistoryTransaction";
import Withdrawal from "./pages/Withdrawal";

function AdminRoute({ children }) {
  const { user } = useAuth();
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.position?.toLowerCase() === "admin";

  return isAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/store" element={<Store />} />
        <Route
          path="/spare"
          element={
            <AdminRoute>
              <Spare />
            </AdminRoute>
          }
        />
        <Route path="/history" element={<HistoryTransaction />} />
        <Route path="/withdrawal/:id" element={<Withdrawal />} />
      </Route>
    </Routes>
  );
}