import { useEffect, useState } from "react";
import api from "../api/axios";

// Composants importés
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import SalesAreaChart from "../components/analytics/SalesAreaChart";
import PieChartCard from "../components/analytics/PieChartCard";
import BarChartCard from "../components/analytics/BarChartCard";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/analytics", {});
      
      if (response.data?.error) {
        const odooError =
          response.data.error?.data?.message ||
          response.data.error?.message ||
          "Erreur serveur Odoo sur /api/analytics";
        setError(odooError);
        return;
      }

      const result = response.data.result || response.data;

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.message || "Impossible de charger les analyses.");
      }
    } catch (err) {
      console.error("Erreur analytics :", err);
      setError("Erreur lors du chargement des analyses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#ececf5] p-6">
        <p className="text-slate-500">Chargement des analyses...</p>
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

  const {
    monthly_sales = [],
    top_products = [],
    top_clients = [],
    conversion = [],
    stock = [],
  } = analyticsData || {};

  return (
    <div className="space-y-5">
      <AnalyticsHeader onRefresh={loadAnalytics} />

      <SalesAreaChart data={monthly_sales} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PieChartCard 
          title="Statut des commandes" 
          subtitle="Répartition par état" 
          data={conversion} 
        />
        <PieChartCard 
          title="État du stock" 
          subtitle="Répartition du niveau de stock" 
          data={stock} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BarChartCard 
          title="Top produits" 
          subtitle="Produits générant le plus de chiffre d'affaires" 
          data={top_products} 
          barColor="#4f46ff"
        />
        <BarChartCard 
          title="Top clients" 
          subtitle="Clients ayant généré le plus de revenus" 
          data={top_clients} 
          barColor="#22c55e"
        />
      </div>
    </div>
  );
}