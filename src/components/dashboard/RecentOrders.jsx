import React from "react";
import { Link } from "react-router-dom"; // Remplacez par "next/link" si vous utilisez Next.js
import StatusBadge from "../ui/StatusBadge";
import { formatCurrency } from "../../utils/formatters";

export default function RecentOrders({ orders }) {
  // On récupère uniquement les 5 premières commandes
  const displayedOrders = orders.slice(0, 4);

  return (
    <div className="xl:col-span-7 bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] font-bold text-[#10174f]">Commandes récentes</h3>
        <button className="px-4 py-2 rounded-full border border-[#ececf5] text-slate-400 text-sm">
          En direct
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-left text-slate-400 text-sm border-b border-[#ececf5]">
              <th className="pb-3 font-medium">Référence</th>
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Montant</th>
              <th className="pb-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.length > 0 ? (
              displayedOrders.map((order, index) => (
                <tr key={index} className="border-b border-[#f3f4f8] text-[#10174f]">
                  <td className="py-4">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4">{order.date}</td>
                  <td className="py-4">{formatCurrency(order.amount)}</td>
                  <td className="py-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-400">
                  Aucune commande récente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bouton pour rediriger vers la page complète, affiché seulement s'il y a plus de 5 commandes */}
      {orders.length > 4 && (
        <div className="mt-5 flex justify-center border-t border-[#ececf5] pt-5">
          <Link 
            to="/orders" 
            className="px-6 py-2.5 bg-[#f3f4f8] hover:bg-[#e2e4eb] text-[#10174f] font-medium rounded-full text-sm transition-colors duration-200"
          >
            Voir toutes les commandes
          </Link>
        </div>
      )}
    </div>
  );
}