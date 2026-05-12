import { Card, ToggleField } from "../SettingsUI";

export default function PaymentSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Méthodes de paiement" subtitle="Choisis les moyens de paiement disponibles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField label="Paiement à la livraison" description="Permet au client de payer à la réception" checked={form.codEnabled} onChange={(val) => updateField("codEnabled", val)} />
          <ToggleField label="Demande de devis" description="Permet d’envoyer une demande de devis au lieu de payer" checked={form.quoteEnabled} onChange={(val) => updateField("quoteEnabled", val)} />
          <ToggleField label="Virement bancaire" description="Permet le paiement par virement bancaire" checked={form.bankTransferEnabled} onChange={(val) => updateField("bankTransferEnabled", val)} />
        </div>
      </Card>
    </div>
  );
}