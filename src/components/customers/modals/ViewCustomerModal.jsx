import React from "react";
import Modal from "../../ui/Modal";
import { Mail, Phone, MapPin, Package, Wallet, Calendar } from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "Aucune commande";
  const date = new Date(value);
  return date.toLocaleDateString("fr-FR");
}

export default function ViewCustomerModal({ open, onClose, customer }) {
  if (!customer) return null;

  return (
    <Modal open={open} title="Profil complet du client" onClose={onClose}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden mb-4">
          {customer.image_url ? (
            <img src={`/odoo-api${customer.image_url}`} className="w-full h-full object-cover" alt={customer.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-3xl bg-slate-50">{customer.name.charAt(0)}</div>
          )}
        </div>
        <h2 className="text-2xl font-black text-[#10174f]">{customer.name}</h2>
        <span className={`mt-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${customer.status === "actif" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
          {customer.status === "actif" ? "● Compte Actif" : "● Inactif"}
        </span>
      </div>

      <div className="bg-[#fafafe] rounded-[28px] border border-[#ececf5] p-6 space-y-5 mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Coordonnées & Localisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex items-center gap-3 text-[#10174f]">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#4f46ff]"><Mail size={18} /></div>
            <div><p className="text-[10px] uppercase text-slate-400 font-bold">Email</p><p className="font-medium text-sm">{customer.email || "Non renseigné"}</p></div>
          </div>
          <div className="flex items-center gap-3 text-[#10174f]">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#4f46ff]"><Phone size={18} /></div>
            <div><p className="text-[10px] uppercase text-slate-400 font-bold">Téléphone</p><p className="font-medium text-sm">{customer.phone || "Non renseigné"}</p></div>
          </div>
          <div className="flex items-center gap-3 text-[#10174f]">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#4f46ff]"><MapPin size={18} /></div>
            <div><p className="text-[10px] uppercase text-slate-400 font-bold">Ville / Localisation</p><p className="font-medium text-sm">{customer.city || "Non renseignée"}</p></div>
          </div>
          <div className="flex items-center gap-3 text-[#10174f]">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-orange-400"><Calendar size={18} /></div>
            <div><p className="text-[10px] uppercase text-slate-400 font-bold">Dernière activité</p><p className="font-medium text-sm">{formatDate(customer.last_order_date)}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 flex items-center gap-4 shadow-sm hover:border-[#4f46ff] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Package size={22} /></div>
          <div><p className="text-xs text-slate-400 font-medium">Commandes passées</p><p className="text-xl font-black text-[#10174f]">{customer.total_orders}</p></div>
        </div>
        <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 flex items-center gap-4 shadow-sm hover:border-emerald-500 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Wallet size={22} /></div>
          <div><p className="text-xs text-slate-400 font-medium">Chiffre d'affaires</p><p className="text-xl font-black text-[#10174f]">{formatCurrency(customer.total_spent)}</p></div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={onClose} className="h-12 px-10 rounded-full bg-[#10174f] text-white font-bold hover:opacity-90 transition shadow-lg">Fermer le profil</button>
      </div>
    </Modal>
  );
}