import { Boxes } from "lucide-react";
import { Card, InputField, ToggleField } from "../SettingsUI";

export default function StockSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Paramètres du stock" subtitle="Règle les alertes et l’affichage de la disponibilité">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Seuil stock faible" icon={Boxes} value={form.lowStockThreshold} onChange={(e) => updateField("lowStockThreshold", e.target.value)} placeholder="5" />
          <ToggleField label="Alerte stock faible" description="Active les alertes pour les quantités faibles" checked={form.stockAlertEnabled} onChange={(val) => updateField("stockAlertEnabled", val)} />
          <ToggleField label="Afficher la disponibilité" description="Afficher l’état du stock sur la boutique" checked={form.displayAvailability} onChange={(val) => updateField("displayAvailability", val)} />
        </div>
      </Card>
    </div>
  );
}