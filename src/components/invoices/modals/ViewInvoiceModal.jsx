import { useEffect, useState } from "react";
import { X, Receipt, Loader2, Download, FileText } from "lucide-react";
import api from "../../../api/axios";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import PaymentBadge from "../PaymentBadge";

export default function ViewInvoiceModal({ isOpen, onClose, invoiceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 // Remplace juste la partie logic de ton useEffect :
useEffect(() => {
  if (isOpen && invoiceId) {
    const loadData = async () => {
      setLoading(true);
      setData(null);
      setError("");
      try {
        const res = await api.post("/api/invoice/detail", { invoice_id: invoiceId });
        const result = res.data.result || res.data; 
        
        // --- AJOUTE CE LOG ICI ---
        console.log("DEBUG DATA ODOO:", result);
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Erreur de connexion.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }
}, [isOpen, invoiceId]);

  const handleDownloadPDF = () => {
    if (!invoiceId) return;
    // Pour le téléchargement, on ouvre directement l'URL dans un nouvel onglet
    // Axios n'est pas idéal pour gérer les flux binaires de téléchargement direct
    const url = `${api.defaults.baseURL}/api/invoice/download_pdf?invoice_id=${invoiceId}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#10174f]/30 backdrop-blur-sm p-4">
      {/* Container principal du modal avec animation */}
      <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- EN-TÊTE DU MODAL --- */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#ececf5]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f1efff] text-[#4f46ff] flex items-center justify-center">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#10174f]">
                Détails de la facture
              </h2>
              <p className="text-slate-400 mt-1">{data?.name || "Chargement..."}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- CORPS DU MODAL (Scrollable) --- */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-[#4f46ff]" size={40} />
              <p className="font-medium">Récupération des données depuis Odoo...</p>
            </div>
          ) : error ? (
            <div className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          ) : data && (
            <>
              {/* Panneau d'information principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fafafe] p-6 rounded-3xl border border-[#ececf5]">
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Client</p>
                  <p className="text-lg font-semibold text-[#10174f]">{data.customer}</p>
                </div>
                <div className="space-y-1.5 md:text-right">
                  <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Statut</p>
                  <div className="md:justify-end flex">
                    <PaymentBadge state={data.state} paymentState={data.payment_state} />
                  </div>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 gap-6 pt-5 border-t border-[#ececf5] mt-2">
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Date Facture</p>
                    <p className="font-medium text-[#10174f]">{formatDate(data.invoice_date)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Date d'échéance</p>
                    <p className="font-medium text-[#10174f]">{formatDate(data.due_date)}</p>
                  </div>
                </div>
              </div>



              {/* Zone des totaux */}
              <div className="flex justify-end pt-2">
                <div className="w-full max-w-xs space-y-3 bg-[#fafafe] p-5 rounded-2xl border border-[#ececf5]">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Sous-total HT</span>
                    <span>{formatCurrency(data.amount_untaxed)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-extrabold text-[#4f46ff] pt-3 border-t border-dashed border-[#ececf5]">
                    <span>Total TTC</span>
                    <span>{formatCurrency(data.amount_total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- PIED DU MODAL (Actions) --- */}
        <div className="p-6 md:p-8 border-t border-[#ececf5] bg-[#fafafe] flex flex-col sm:flex-row justify-between gap-4 rounded-b-[32px]">
          {/* Bouton de téléchargement PDF */}
          {data && !loading && !error && (
            <button 
              onClick={handleDownloadPDF}
              className="px-6 py-3 rounded-xl bg-white border border-[#ececf5] text-[#10174f] font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <FileText size={18} className="text-red-500" />
              Télécharger la facture PDF
            </button>
          )}
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl bg-white border border-[#ececf5] text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}