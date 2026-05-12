import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Analytics from "../pages/Analytics";
import Stock from "../pages/Stock";
import Customers from "../pages/Customers";
import Invoices from "../pages/Invoices";
import Settings from "../pages/Settings";
import Discuss from "../pages/Discuss";
import Formations from "../pages/Formations";
import FormationsDemande from '../pages/FormationsDemande';
import SdsNexus from "../pages/SdsNexus";
import SearchPage from "../pages/SearchPage";
function Placeholder({ title }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-6">
      <h1 className="text-2xl font-bold text-[#10174f]">{title}</h1>
      <p className="text-slate-400 mt-2">Page en cours de développement.</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="customers" element={<Customers />} />
          <Route path="stock" element={<Stock />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="settings" element={<Settings />} />
          <Route path="discuss" element={<Discuss />} />
          <Route path="formations" element={<Formations />} />
          <Route path="formations_demande" element={<FormationsDemande />} />
          <Route path="sdsNexus" element={<SdsNexus />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}