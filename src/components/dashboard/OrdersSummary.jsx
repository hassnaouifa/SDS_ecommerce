import React from "react";
import { formatCurrency } from "../../utils/formatters";

export default function OrdersSummary({ stats }) {
  return (
    <div className="bg-gradient-to-r from-[#4f46ff] to-[#5b4dff] rounded-[24px] p-6 text-white overflow-hidden relative">
      <div className="max-w-[330px]">
        <h3 className="text-[18px] font-bold">
          {stats.total_orders} commandes enregistrées
        </h3>
        <p className="text-white/80 mt-2">
          {stats.total_visitors} clients actifs • {formatCurrency(stats.total_revenue)} générés
        </p>
      </div>
    </div>
  );
}