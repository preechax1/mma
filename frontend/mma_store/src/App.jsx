import { useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";

import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import Spare from "./pages/Spare";
import HistoryTransaction from "./pages/HistoryTransaction";
import Withdrawal from "./pages/Withdrawal";

function AdminRoute({ children, user }) {
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.position?.toLowerCase() === "admin";

  return isAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || savedUser === "undefined") return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Routes>
      <Route
        element={
          <Layout
            user={user}
            logout={logout}
            onUserChange={setUser}
          />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/store" element={<Store />} />
        <Route
          path="/spare"
          element={
            <AdminRoute user={user}>
              <Spare user={user} />
            </AdminRoute>
          }
        />
        <Route path="/history" element={<HistoryTransaction user={user} />} />
        <Route path="/withdrawal/:id" element={<Withdrawal user={user} />} />
      </Route>
    </Routes>
  );
}