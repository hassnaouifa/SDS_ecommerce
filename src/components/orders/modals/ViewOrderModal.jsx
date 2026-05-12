import React from "react";
import Modal from "../../ui/Modal";
import { formatCurrency } from "../../../utils/formatters";
import { 
  Building2, Hash, Calendar, User, 
  FileText, CheckCircle2, Package 
} from "lucide-react"; // Assure-toi que lucide-react est bien installé

export default function ViewOrderModal({ open, onClose, order }) {
  if (!order) return null;

  // AJOUTE CETTE LIGNE ICI POUR DEBUGGER
  console.log("DONNÉES DE LA COMMANDE REÇUES :", order);

  const hasICE = order.customer_ice && order.customer_ice.trim() !== "";
  const companyName = order.customer_company_name || "Non renseignée";
  

  return (
    <Modal open={open} title="Détail complet de la commande" onClose={onClose}>
      <div className="space-y-5">
        
        {/* --- BANNIÈRE INCLINÉE VERTE (Conditionnelle) --- */}
        {hasICE && (
          <div className="relative w-full h-14 mb-4 mx-auto w-[98%]">
            {/* Le fond vert incliné */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 transform -skew-x-12 rounded-xl shadow-md border border-emerald-300"></div>
            {/* Le texte au-dessus (non incliné pour rester lisible) */}
            <div className="absolute inset-0 flex items-center justify-between px-6 text-white font-medium">
              <div className="flex items-center gap-2">
                <Building2 size={20} />
                <span>Entreprise : <strong className="font-bold">{companyName}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/30 shadow-sm">
                <CheckCircle2 size={16} />
                <span>ICE : <strong className="font-bold">{order.customer_ice}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* --- GRILLE D'INFORMATIONS PRINCIPALES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="flex items-start gap-3 rounded-[18px] bg-white border border-[#ececf5] p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#f5f3ff] text-[#4f46ff] flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Référence</p>
              <p className="font-bold text-[#10174f] mt-0.5 text-lg">{order.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[18px] bg-white border border-[#ececf5] p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#f5f3ff] text-[#4f46ff] flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Client</p>
              <p className="font-bold text-[#10174f] mt-0.5 text-lg">{order.customer}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[18px] bg-white border border-[#ececf5] p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#f5f3ff] text-[#4f46ff] flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Date de commande</p>
              <p className="font-bold text-[#10174f] mt-0.5 text-lg">{order.date_order}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[18px] bg-gradient-to-br from-[#10174f] to-[#1a237e] border border-[#10174f] p-4 shadow-md transform hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 backdrop-blur-md">
              <Hash size={18} />
            </div>
            <div>
              <p className="text-sm text-[#a5b4fc] font-medium">Montant total</p>
              <p className="font-bold text-white mt-0.5 text-xl">{formatCurrency(order.amount_total)}</p>
            </div>
          </div>
        </div>

        {/* --- LIGNES DE COMMANDE --- */}
        <div className="rounded-[20px] bg-white border border-[#ececf5] overflow-hidden shadow-sm">
          <div className="bg-[#fafafe] px-5 py-3 border-b border-[#ececf5] flex items-center gap-2">
            <Package size={18} className="text-[#4f46ff]" />
            <p className="font-bold text-[#10174f]">Détail des articles</p>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {order.lines?.map((line) => (
              <div key={line.id} className="flex items-center justify-between border border-[#ececf5] rounded-[14px] px-4 py-3 bg-white hover:border-[#cfc8ff] transition-colors">
                <div>
                  <p className="font-medium text-[#10174f]">{line.product_name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="font-medium text-slate-500">Qté:</span> {line.quantity} &nbsp;•&nbsp; 
                    <span className="font-medium text-slate-500">Prix unitaire:</span> {formatCurrency(line.unit_price)}
                  </p>
                </div>
                <p className="font-bold text-[#4f46ff] bg-[#f5f3ff] px-3 py-1 rounded-lg">
                  {formatCurrency(line.amount)}
                </p>
              </div>
            ))}
            {(!order.lines || order.lines.length === 0) && (
              <p className="text-center text-sm text-slate-400 py-4">Aucun article dans cette commande.</p>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
}