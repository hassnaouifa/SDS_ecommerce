import React from "react";
import Modal from "../../ui/Modal";
import { Loader2, Truck, CheckCircle } from "lucide-react";

export default function DeliveryModal({ open, onClose, deliveryStep, order, onValidateDelivery }) {
  return (
    <Modal open={open} title={deliveryStep === "success" ? "Expédition terminée !" : "Validation de l'expédition"} onClose={onClose}>
      {deliveryStep === "processing" ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center relative">
            <Loader2 size={32} className="text-amber-500 animate-spin absolute" />
            <Truck size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#10174f]">Validation des stocks...</h3>
            <p className="text-slate-400 mt-2">Odoo est en train de déduire les articles de votre inventaire.</p>
          </div>
        </div>
      ) : deliveryStep === "success" ? (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-200">
            <CheckCircle size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#10174f]">Livraison Validée !</h3>
            <p className="text-slate-500 mt-2">Le bon de livraison a été marqué comme "Terminé".<br/>Les stocks ont été mis à jour.</p>
          </div>
          <button onClick={onClose} className="mt-6 w-full h-12 bg-[#10174f] text-white font-bold rounded-full hover:bg-[#1a237e] transition shadow-lg">
            Fermer
          </button>
        </div>
      ) : (
        <div className="py-4 space-y-6">
          <div className="bg-[#fafafe] rounded-[20px] border border-[#ececf5] p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Truck size={28} />
            </div>
            <h4 className="font-bold text-[#10174f] text-lg">Confirmer l'envoi des produits</h4>
            <p className="text-sm text-slate-500 mt-2">Vous êtes sur le point de valider la livraison pour <strong>{order?.name}</strong>.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 border border-[#ececf5] text-slate-500 font-bold rounded-full hover:bg-slate-50 transition">Annuler</button>
            <button onClick={onValidateDelivery} className="flex-1 h-12 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition shadow-lg flex items-center justify-center gap-2">
              <Truck size={18} /> Valider la livraison
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}