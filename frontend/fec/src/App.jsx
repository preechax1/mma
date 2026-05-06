import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";

import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import UpdateForm from "./pages/UpdateForm";

export default function App() {
  return (
    <BrowserRouter basename="/fec/">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/record/records" element={<Records />} /> 
          <Route path="/record/recordsn/:serial" element={<Records />} />
          <Route path="/record/recordid/:id" element={<Records />} />





          <Route path="/detail" element={<Records />} />
          <Route path="/history" element={<Records />} />
          <Route path="/manage" element={<UpdateForm />} />
          <Route path="/updateform/:id?" element={<UpdateForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
