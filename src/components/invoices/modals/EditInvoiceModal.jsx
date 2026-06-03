import { useEffect, useState } from "react";
import { X, Save, Receipt, Loader2, AlertCircle, Calendar, FileEdit } from "lucide-react";
import api from "../../../api/axios";

export default function EditInvoiceModal({ isOpen, onClose, invoiceId, onSaved }) {
  const [formData, setFormData] = useState({ reference: "", due_date: "" });
  const [data, setData] = useState(null); // Pour afficher le nom et le client en haut
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && invoiceId) {
      const loadData = async () => {
        setLoading(true);
        setError("");
        try {
          const res = await api.post("/api/invoice/detail", { invoice_id: invoiceId });
          const result = res.data.result || res.data;
          if (result.success) {
            setData(result.data);
// Dans ton useEffect, remplace le setFormData par ceci :
const rawDate = result.data.due_date;
let safeDate = "";

if (rawDate) {
  // Si Odoo renvoie "YYYY-MM-DD HH:MM:SS", on ne garde que "YYYY-MM-DD"
  // Si Odoo renvoie "YYYY-MM-DD", ça reste "YYYY-MM-DD"
  safeDate = rawDate.split(' ')[0]; 
}

setFormData({ 
  reference: result.data.reference || "", 
  due_date: safeDate 
});
          } else {
            setError(result.message);
          }
        } catch (err) {
          setError("Erreur de chargement des données.");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen, invoiceId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/api/invoice/update", { 
        invoice_id: invoiceId, 
        data: formData 
      });
      const result = res.data.result || res.data;
      if (result.success) {
        onSaved(); 
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#10174f]/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-[#ececf5] flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileEdit size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#10174f]">Modifier la facture</h2>
              <p className="text-xs text-slate-400">{data?.name || "..."}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-amber-600" size={32} />
              <p className="text-sm text-slate-500">Chargement des informations...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 border border-red-100 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Info Client (Lecture seule) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Client</p>
                <p className="text-sm font-semibold text-[#10174f]">{data?.customer || "—"}</p>
              </div>



              {/* Champ Date d'échéance */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Date d'échéance</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full h-12 pl-4 pr-4 rounded-xl border border-[#ececf5] bg-[#fafafe] text-sm text-[#10174f] font-medium outline-none focus:border-amber-500 focus:bg-white transition-all"
                    value={formData.due_date} 
                    onChange={e => setFormData({...formData, due_date: e.target.value})} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1 italic">Cette date sera mise à jour dans Odoo</p>
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 border-t border-[#ececf5] bg-[#fafafe] flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl border border-[#ececf5] bg-white text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>
          
          {!loading && !error && (
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 flex items-center gap-2 shadow-lg shadow-amber-100 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{saving ? "Sauvegarde..." : "Enregistrer"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}