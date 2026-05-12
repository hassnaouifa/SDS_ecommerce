import { useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import {
  Settings as SettingsIcon, Globe, Store, Truck, Receipt,
  CreditCard, Boxes, Bell, Headset, Save
} from "lucide-react";

import { SectionButton, SummaryCard } from "../components/SettingsUI";

import GeneralSection from "../components/settings/GeneralSection";
import StoreSection from "../components/settings/StoreSection";
import DeliverySection from "../components/settings/DeliverySection";
import InvoicingSection from "../components/settings/InvoicingSection";
import PaymentSection from "../components/settings/PaymentSection";
import StockSection from "../components/settings/StockSection";
import NotificationsSection from "../components/settings/NotificationsSection";
import SupportSection from "../components/settings/SupportSection";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Plus aucune donnée codée en dur ! On initialise vide.
  const [form, setForm] = useState({
    siteName: "", siteEmail: "", sitePhone: "", siteAddress: "", language: "", currency: "",
    showPrices: false, showStock: false, enablePromotions: false, productsPerPage: "", hideOutOfStock: false,
    deliveryDelay: "", deliveryFees: "", freeDeliveryFrom: "", deliveryNote: "", phoneConfirmation: false,
    invoiceEnabled: false, vatEnabled: false, vatRate: "", ice: "", invoiceNote: "",
    codEnabled: false, quoteEnabled: false, bankTransferEnabled: false,
    lowStockThreshold: "", stockAlertEnabled: false, displayAvailability: false,
    orderEmail: "", quoteEmail: "", autoReplyMessage: "",
    whatsapp: "", supportEmail: "", supportPhone: "", supportHours: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      setMessage("");
      
      const response = await api.post("/api/settings", { params: {} });
      console.log("Réponse Odoo:", response.data); // 👈 Regarde ta console F12 !

      // Gestion des erreurs natives Odoo
      if (response.data?.error) {
        const errorMsg = response.data.error.data?.message || response.data.error.message;
        setMessage(`Erreur système Odoo: ${errorMsg}`);
        setLoading(false);
        return;
      }

      const result = response.data.result;

      // Gestion de nos données ou de l'erreur Python
      if (result && result.success) {
        setForm((prev) => ({ ...prev, ...result.data }));
      } else {
        // Ici, on affichera l'erreur Python exacte si elle existe
        setMessage(`Erreur: ${result?.message || "Données introuvables"}`);
      }
    } catch (error) {
      console.error("Erreur axios:", error);
      setMessage(`Erreur réseau: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage("");
      // Envoi des modifications à Odoo
      const response = await api.post("/api/settings/save", { params: form });
      
      const result = response.data.result || response.data;

      if (result.success) {
        setMessage("Paramètres enregistrés avec succès.");
      } else {
        setMessage(result.error || "Erreur lors de l’enregistrement.");
      }
    } catch (error) {
      console.error("Erreur enregistrement paramètres :", error);
      setMessage("Erreur lors de l’enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const sectionTitle = useMemo(() => {
    const map = { general: "Paramètres généraux", store: "Paramètres boutique", delivery: "Paramètres livraison", invoicing: "Paramètres facturation", payment: "Paramètres paiement", stock: "Paramètres stock", notifications: "Paramètres notifications", support: "Paramètres support" };
    return map[activeSection] || "Paramètres";
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case "general": return <GeneralSection form={form} updateField={updateField} />;
      case "store": return <StoreSection form={form} updateField={updateField} />;
      case "delivery": return <DeliverySection form={form} updateField={updateField} />;
      case "invoicing": return <InvoicingSection form={form} updateField={updateField} />;
      case "payment": return <PaymentSection form={form} updateField={updateField} />;
      case "stock": return <StockSection form={form} updateField={updateField} />;
      case "notifications": return <NotificationsSection form={form} updateField={updateField} />;
      case "support": return <SupportSection form={form} updateField={updateField} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-[24px] border border-[#ececf5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h1 className="text-[32px] font-bold text-[#10174f]">Paramètres</h1>
            <p className="text-slate-400 text-sm mt-1">Configuration synchronisée avec Odoo</p>
          </div>
        </div>

        <button onClick={saveSettings} disabled={saving} className="h-12 px-5 rounded-full bg-[#4f46ff] text-white flex items-center gap-2 shadow-[0_12px_24px_rgba(79,70,255,0.20)] disabled:opacity-60 transition-all hover:bg-[#3f38cc]">
          <Save size={16} />
          <span>{saving ? "Sauvegarde en cours..." : "Enregistrer les modifications"}</span>
        </button>
      </div>

      {message && (
        <div className={`rounded-[18px] px-4 py-3 text-sm font-medium ${message.includes("succès") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 space-y-3">
          <SectionButton icon={Globe} label="Général" value="general" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={Store} label="Boutique" value="store" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={Truck} label="Livraison" value="delivery" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={Receipt} label="Facturation" value="invoicing" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={CreditCard} label="Paiement" value="payment" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={Boxes} label="Stock" value="stock" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={Bell} label="Notifications" value="notifications" activeSection={activeSection} onClick={setActiveSection} />
          <SectionButton icon={Headset} label="Support" value="support" activeSection={activeSection} onClick={setActiveSection} />
        </div>

        <div className="xl:col-span-9 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard title="Section active" value={sectionTitle} />
            <SummaryCard title="Langue" value={form.language === "fr_FR" ? "Français" : form.language === "ar_001" ? "Arabe" : form.language || "Non définie"} />
            <SummaryCard title="Devise système" value={form.currency || "---"} />
          </div>

          {renderSection()}
        </div>
      </div>
    </div>
  );
}