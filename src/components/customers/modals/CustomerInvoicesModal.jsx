import React, { useEffect, useState } from "react";
import { X, FileText, Download } from "lucide-react";
import api from "../../../api/axios";

export default function CustomerInvoicesModal({ open, onClose, customer }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customer) {
      loadCustomerInvoices();
    }
  }, [open, customer]);

// Dans CustomerInvoicesModal.jsx
const loadCustomerInvoices = async () => {
  if (!customer?.id) return; // Sécurité si l'ID est manquant
  
  setLoading(true);
  try {
    // On envoie le partner_id spécifique du client sélectionné
    const response = await api.post("/api/invoices", { 
      partner_id: customer.id 
    });
    
    const result = response.data.result || response.data;
    if (result.success) {
      setInvoices(result.data.invoices);
    }
  } catch (err) {
    console.error("Erreur lors de la récupération des factures du client.");
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fafafe]">
          <div>
            <h2 className="text-xl font-bold text-[#10174f]">Factures de {customer?.name}</h2>
            <p className="text-sm text-slate-400">Historique des transactions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Chargement...</div>
          ) : invoices.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-slate-100">
                  <th className="pb-3">N° Facture</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Total TTC</th>
                  <th className="pb-3 text-center">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="text-sm">
                    <td className="py-4 font-medium">{inv.name}</td>
                    <td className="py-4 text-slate-500">{inv.invoice_date}</td>
                    <td className="py-4 text-right font-bold">{inv.amount_total} {inv.currency}</td>
                    <td className="py-4 text-center">
                       <span className={`px-2 py-1 rounded-md text-[10px] ${inv.payment_state === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {inv.payment_state === 'paid' ? 'Payé' : 'En attente'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-slate-400">Aucune facture trouvée pour ce client.</div>
          )}
        </div>
      </div>
    </div>
  );
}