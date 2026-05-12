import React from "react";
import Modal from "../../ui/Modal";
import { Loader2, ShieldCheck, CheckCircle, FileText, Download, Truck, CreditCard } from "lucide-react";

export default function PaymentModal({ open, onClose, paymentStep, checkoutData, order, onGoToDelivery, onConfirmPayment }) {
  return (
    <Modal 
      open={open} 
      title={paymentStep === "success" ? "Commande finalisée !" : "Paiement sécurisé"} 
      onClose={onClose}
    >
      {/* NOUVELLE ÉTAPE : DEMANDE DE CONFIRMATION */}
      {paymentStep === "idle" ? (
        <div className="py-4 space-y-6">
          <div className="bg-[#fafafe] rounded-[20px] border border-[#ececf5] p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CreditCard size={28} />
            </div>
            <h4 className="font-bold text-[#10174f] text-lg">Confirmer le paiement</h4>
            <p className="text-sm text-slate-500 mt-2">
              Vous êtes sur le point de valider le paiement et générer la facturation pour la commande <strong>{order?.name}</strong>.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 h-12 border border-[#ececf5] text-slate-500 font-bold rounded-full hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirmPayment} 
              className="flex-1 h-12 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> 
              Confirmer le paiement
            </button>
          </div>
        </div>
      ) : 

      /* ÉTAPE DE CHARGEMENT */
      paymentStep === "processing" ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f1efff] flex items-center justify-center relative">
            <Loader2 size={32} className="text-[#4f46ff] animate-spin absolute" />
            <ShieldCheck size={20} className="text-[#4f46ff]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#10174f]">Traitement du paiement...</h3>
            <p className="text-slate-400 mt-2">Veuillez patienter pendant la validation bancaire et la création des documents.</p>
          </div>
        </div>
      ) : 
      
      /* ÉTAPE DE SUCCÈS */
      paymentStep === "success" && checkoutData ? (
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-4 shadow-sm border border-emerald-200">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-[#10174f]">Paiement accepté !</h3>
            <p className="text-slate-500 mt-1">La commande <span className="font-semibold">{order?.name}</span> a été validée avec succès.</p>
          </div>
          <div className="bg-[#fafafe] rounded-[20px] border border-[#ececf5] p-6 space-y-6">
            <div className="flex items-start justify-between pb-6 border-b border-[#ececf5]">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${checkoutData.has_ice ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#10174f] text-lg">Étape 1 : Facturation</h4>
                  <p className="text-sm text-slate-500 mt-1">{checkoutData.has_ice ? "Facture officielle générée." : "Reçu de paiement disponible."}</p>
                </div>
              </div>
              {checkoutData.has_ice && checkoutData.invoice_created ? (
                <a href={`http://localhost:8069${checkoutData.invoice_url}`} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-2 hover:bg-blue-700 transition shadow-md whitespace-nowrap ml-4">
                  <Download size={18} /> Facture
                </a>
              ) : (
                <span className="text-sm font-medium text-slate-500 bg-slate-200 px-4 py-2 rounded-full whitespace-nowrap ml-4">Reçu uniquement</span>
              )}
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${checkoutData.delivery_ready ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#10174f] text-lg">Étape 2 : Livraison</h4>
                  <p className="text-sm text-slate-500 mt-1">{checkoutData.delivery_ready ? "Bon de livraison généré." : "Aucun bon généré."}</p>
                </div>
              </div>
              {checkoutData.delivery_ready && (
                <button onClick={onGoToDelivery} className="px-5 py-2.5 border-2 border-[#ececf5] text-[#10174f] text-sm font-bold rounded-full hover:bg-slate-50 transition whitespace-nowrap ml-4">
                  Gérer l'expédition
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-full h-14 bg-[#10174f] text-white font-bold rounded-full hover:bg-[#1a237e] transition shadow-lg">
            Fermer et retourner au tableau de bord
          </button>
        </div>
      ) : null}
    </Modal>
  );
}