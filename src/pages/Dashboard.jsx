import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Home, Download, ShoppingCart, Users, BadgeDollarSign, Wallet, RefreshCw } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

// Imports des composants séparés
import StatCard from "../components/dashboard/StatCard";
import SalesEvolution from "../components/dashboard/SalesEvolution";
import OrdersSummary from "../components/dashboard/OrdersSummary";
import ConversionWidget from "../components/dashboard/ConversionWidget";
import TopProducts from "../components/dashboard/TopProducts";
import RecentOrders from "../components/dashboard/RecentOrders";
import ActivityOverview from "../components/dashboard/ActivityOverview";

export default function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false); // Nouvel état pour l'animation du bouton

const loadDashboard = async () => {
    try {
      setLoading(dashboardData === null);
      setError("");
      
      // ✅ CORRECTION ICI : Envelopper dans "params" pour Odoo
      const response = await api.post("/api/dashboard", { 
        params: { year: year } 
      });
      
      const result = response.data.result || response.data;
      
      if (result.success) {
        setDashboardData(result);
      } else {
        setError(result.message || "Erreur dashboard");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // Ce useEffect garantit que TOUTE la page se met à jour quand l'année change
  useEffect(() => {
    loadDashboard();
  }, [year]);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#ececf5] p-6 flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[#4f46ff]" size={32} />
          <p className="text-slate-500 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-[24px] border border-red-200 p-6 text-red-600">
        {error}
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const monthlySales = dashboardData?.monthly_sales || [];
  const recentOrders = dashboardData?.recent_orders || [];
  const topProducts = dashboardData?.top_products || [];
  const activityData = dashboardData?.traffic || [];

  const statCards = [
    { icon: ShoppingCart, title: "Total des ventes", value: stats.total_sales ?? 0 },
    { icon: Users, title: "Total des visiteurs", value: stats.total_visitors ?? 0 },
    { icon: Wallet, title: "Total des commandes", value: stats.total_orders ?? 0 },
    { icon: BadgeDollarSign, title: "Chiffre d’affaires", value: formatCurrency(stats.total_revenue)},
  ];

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center shadow-lg shadow-[#4f46ff]/20">
            <Home size={20} />
          </div>
          <h1 className="text-[32px] font-bold text-[#10174f]">Tableau de bord</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))} 
            className="h-12 px-5 rounded-full border border-[#ececf5] bg-white text-[#10174f] font-medium outline-none focus:border-[#4f46ff] focus:ring-2 focus:ring-[#4f46ff]/20 transition-all cursor-pointer shadow-sm hover:border-slate-300"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>Année {y}</option>
            ))}
          </select>
          
          {/* BOUTON ACTUALISER RESTYLISÉ */}
          <button 
            onClick={loadDashboard} 
            disabled={isRefreshing}
            className="h-12 px-6 rounded-full bg-[#4f46ff] hover:bg-[#3b35cc] text-white flex items-center gap-2 transition-all duration-200 shadow-[0_8px_16px_rgba(79,70,255,0.25)] hover:shadow-[0_12px_20px_rgba(79,70,255,0.4)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            <span className="font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} chartData={monthlySales} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <SalesEvolution monthlySales={monthlySales} year={year} />
        <div className="xl:col-span-7 space-y-4">
          <OrdersSummary stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConversionWidget stats={stats} />
            <TopProducts products={topProducts} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <RecentOrders orders={recentOrders} />
        <ActivityOverview activityData={activityData} />
      </div>
    </div>
  );
}