import React from "react";
import { CheckCircle2, CreditCard, Download, Truck, Trash2, ChevronRight } from "lucide-react";

// J'ai rajouté "isPaymentDone" dans les paramètres ici :
export default function OrderStatusBar({ order, isPaymentDone, onValidate, onPay, onDeliver, onDelete }) {
  if (!order) return null;

  // ✅ LOGIQUE ROBUSTE : Odoo peut être lent à dire "invoiced". 
  // On bloque donc le bouton si invoice_id existe OU si on vient juste de finir le tunnel de paiement !
  const isConfirmed = ['sale', 'done'].includes(order.state);
  const isInvoiced = order.invoice_status === 'invoiced' || !!order.invoice_id || isPaymentDone;
  const isDelivered = order.delivery_status === 'delivered';

  // Calcul du pipeline pour faire avancer la ligne bleue
  let currentStep = 1;
  if (isConfirmed) currentStep = 2;
  if (isInvoiced) currentStep = 3;
  if (isDelivered || (order.delivery_status === 'no' && isInvoiced) || order.state === 'done') {
    currentStep = 4;
  }

  const steps = [
    { num: 1, label: "Brouillon" },
    { num: 2, label: "Confirmée" },
    { num: 3, label: "Facturée" },
    { num: 4, label: "Livrée" },
  ];

  const handleDownloadInvoice = () => {
    if (order.invoice_id) {
      const link = document.createElement("a");
      link.href = `http://localhost:8069/report/pdf/account.report_invoice/${order.invoice_id}`;
      link.target = "_blank";
      link.setAttribute("download", `Facture_${order.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-3 mb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm">
      
      {/* GAUCHE : Boutons d'action */}
      <div className="flex items-center gap-2">
        
        {/* 1. Bouton Valider */}
        <button 
          onClick={isConfirmed ? undefined : onValidate} 
          title="Valider la commande" 
          disabled={isConfirmed}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isConfirmed 
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105'
          }`}
        >
          <CheckCircle2 size={18} />
        </button>
        
        {/* 2. Bouton Paiement & Facturation : BLOQUÉ DIRECTEMENT DÈS LE SUCCÈS */}
        <button 
          onClick={isInvoiced || !isConfirmed ? undefined : onPay} 
          title="Paiement & Facturation" 
          disabled={isInvoiced || !isConfirmed}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isInvoiced || !isConfirmed
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
          }`}
        >
          <CreditCard size={18} />
        </button>

        {/* 3. Bouton Télécharger la facture */}
        {isInvoiced && order.invoice_id && (
          <button 
            onClick={handleDownloadInvoice} 
            title="Télécharger la facture" 
            className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm"
          >
            <Download size={18} />
          </button>
        )}

        {/* 4. Bouton Valider la Livraison */}
        <button 
          onClick={isDelivered || !isConfirmed ? undefined : onDeliver} 
          title="Valider la Livraison" 
          disabled={isDelivered || !isConfirmed}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isDelivered || !isConfirmed
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-105'
          }`}
        >
          <Truck size={18} />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        {/* Bouton Supprimer */}
        <button 
          onClick={onDelete} 
          title="Supprimer la commande" 
          className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 hover:scale-105 transition-all shadow-sm"
        >
          <Trash2 size={18} />
        </button>
        
      </div>

      {/* DROITE : Le Pipeline Visuel */}
      <div className="flex items-center overflow-x-auto pb-1 xl:pb-0">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.num;
          const isCurrent = currentStep === step.num;
          
          return (
            <div key={step.num} className="flex items-center">
              <div className={`flex items-center justify-center px-3 py-1 text-sm font-bold transition-colors ${
                isActive ? 'text-[#4f46ff]' : 'text-slate-300'
              } ${isCurrent ? 'border-b-2 border-[#4f46ff]' : ''}`}>
                {step.label}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`mx-1 transition-colors ${isActive && currentStep > step.num ? 'text-[#4f46ff]' : 'text-slate-200'}`}>
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}