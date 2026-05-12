import React from "react";
import { Eye, Pencil, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import PaymentBadge from "./PaymentBadge";

export default function InvoicesTable({ invoices, onView, onEdit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-[#ececf5]">
            <th className="pb-3 px-4 font-medium">Facture & Date</th>
            <th className="pb-3 px-4 font-medium">Client</th>
            <th className="pb-3 px-4 font-medium text-right">Montant</th>
            <th className="pb-3 px-4 font-medium text-center">Statut</th>
            <th className="pb-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="border-b border-[#f3f4f8] hover:bg-[#fafafe] transition-all group"
              >
                {/* 1. FACTURE & DATE */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#10174f] text-sm">{invoice.name || "Brouillon"}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {invoice.invoice_date ? formatDate(invoice.invoice_date) : "Date non définie"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. CLIENT (Avec un petit avatar lettre) */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#f1efff] text-[#4f46ff] text-xs font-bold flex items-center justify-center shrink-0">
                      {invoice.customer ? invoice.customer.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span className="font-medium text-sm text-[#10174f] truncate max-w-[200px]">
                      {invoice.customer || "Client inconnu"}
                    </span>
                  </div>
                </td>

                {/* 3. MONTANT */}
                <td className="py-3 px-4 text-right">
                  <span className="font-bold text-[#10174f] text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-[#ececf5]">
                    {formatCurrency(invoice.amount_total)}
                  </span>
                </td>

                {/* 4. STATUT */}
                <td className="py-3 px-4 text-center">
                  <PaymentBadge state={invoice.state} paymentState={invoice.payment_state} />
                </td>

                {/* 5. ACTIONS (Design harmonisé avec le reste) */}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(invoice.id)}
                      title="Modifier"
                      className="w-8 h-8 rounded-lg border border-[#ececf5] bg-white text-amber-500 flex items-center justify-center hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all shadow-sm shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onView(invoice.id)}
                      title="Voir les détails"
                      className="w-8 h-8 rounded-lg border border-[#ececf5] bg-white text-[#4f46ff] flex items-center justify-center hover:bg-[#f1efff] hover:border-[#cfc8ff] transition-all shadow-sm shrink-0"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-12 text-center">
                <p className="text-slate-400 font-medium">Aucune facture trouvée.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}