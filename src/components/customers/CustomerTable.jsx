import React from "react";
import { Mail, Phone, Pencil, Trash2, Eye, FileText } from "lucide-react";

// --- BADGE DE STATUT ---
function StatusBadge({ status }) {
  const isActive = status === "actif";
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}

export default function CustomerTable({ customers, onEdit, onDelete, onView, onShowInvoices }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="text-left text-slate-400 text-sm border-b border-[#ececf5]">
            <th className="pb-4 font-medium">Client</th>
            <th className="pb-4 font-medium">Contact</th>
            <th className="pb-4 font-medium">Statut</th>
            <th className="pb-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[#f3f4f8] text-[#10174f] hover:bg-slate-50/50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {customer.image_url ? (
                      <img src={`/odoo-api${customer.image_url}`} alt={customer.name} className="w-11 h-11 rounded-full object-cover bg-slate-100 border border-[#ececf5]" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-100 border border-[#ececf5] flex items-center justify-center text-slate-400 font-bold">
                        {customer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#10174f]">{customer.name}</p>
                      <p className="text-xs text-slate-400">ID : {customer.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-slate-400" />
                      <span>{customer.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-slate-400" />
                      <span>{customer.phone || "—"}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4">
                  <StatusBadge status={customer.status} />
                </td>

                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onShowInvoices(customer)} title="Factures" className="w-9 h-9 rounded-xl border border-[#ececf5] bg-white text-emerald-500 flex items-center justify-center hover:bg-emerald-50 transition shadow-sm">
                      <FileText size={16} />
                    </button>
                    <button onClick={() => onView(customer)} title="Détails" className="w-9 h-9 rounded-xl border border-[#ececf5] bg-white text-blue-500 flex items-center justify-center hover:bg-blue-50 transition shadow-sm">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => onEdit(customer)} title="Modifier" className="w-9 h-9 rounded-xl border border-[#ececf5] bg-white text-[#4f46ff] flex items-center justify-center hover:bg-[#f1efff] transition shadow-sm">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(customer)} title="Supprimer" className="w-9 h-9 rounded-xl border border-[#ececf5] bg-white text-red-400 flex items-center justify-center hover:bg-red-50 transition shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">Aucun client trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}