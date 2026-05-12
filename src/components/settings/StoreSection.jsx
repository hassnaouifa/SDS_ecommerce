import { Package } from "lucide-react";
import { Card, ToggleField, InputField } from "../SettingsUI";

export default function StoreSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Configuration de la boutique" subtitle="Gère l’affichage et le comportement e-commerce">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField label="Afficher les prix" description="Les prix seront visibles sur la boutique" checked={form.showPrices} onChange={(val) => updateField("showPrices", val)} />
          <ToggleField label="Afficher le stock" description="Afficher la disponibilité sur les pages produit" checked={form.showStock} onChange={(val) => updateField("showStock", val)} />
          <ToggleField label="Activer les promotions" description="Permet d’utiliser les promotions sur les produits" checked={form.enablePromotions} onChange={(val) => updateField("enablePromotions", val)} />
          <ToggleField label="Masquer les produits en rupture" description="Cache les produits indisponibles sur le site" checked={form.hideOutOfStock} onChange={(val) => updateField("hideOutOfStock", val)} />
          <InputField label="Produits par page" icon={Package} value={form.productsPerPage} onChange={(e) => updateField("productsPerPage", e.target.value)} placeholder="12" />
        </div>
      </Card>
    </div>
  );
}