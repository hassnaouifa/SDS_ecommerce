import { Percent, Receipt } from "lucide-react";
import { Card, ToggleField, InputField, TextareaField } from "../SettingsUI";

export default function InvoicingSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Configuration de la facturation" subtitle="Règle les paramètres liés aux factures et à la TVA">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField label="Option facture activée" description="Permet au client de demander une facture" checked={form.invoiceEnabled} onChange={(val) => updateField("invoiceEnabled", val)} />
          <ToggleField label="TVA activée" description="Active la TVA dans le processus de facturation" checked={form.vatEnabled} onChange={(val) => updateField("vatEnabled", val)} />
          <InputField label="Taux de TVA (%)" icon={Percent} value={form.vatRate} onChange={(e) => updateField("vatRate", e.target.value)} placeholder="20" />
          <InputField label="ICE" icon={Receipt} value={form.ice} onChange={(e) => updateField("ice", e.target.value)} placeholder="ICE entreprise" />
        </div>
        <div className="mt-4">
          <TextareaField label="Texte de facturation" value={form.invoiceNote} onChange={(e) => updateField("invoiceNote", e.target.value)} placeholder="Texte affiché sur la facture" />
        </div>
      </Card>
    </div>
  );
}