import { Truck, Coins } from "lucide-react";
import { Card, InputField, TextareaField, ToggleField } from "../SettingsUI";

export default function DeliverySection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Configuration de la livraison" subtitle="Règle les informations et conditions de livraison">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Délai de livraison" icon={Truck} value={form.deliveryDelay} onChange={(e) => updateField("deliveryDelay", e.target.value)} placeholder="48h à 72h" />
          <InputField label="Frais de livraison" icon={Coins} value={form.deliveryFees} onChange={(e) => updateField("deliveryFees", e.target.value)} placeholder="30" />
          <InputField label="Livraison gratuite à partir de" icon={Coins} value={form.freeDeliveryFrom} onChange={(e) => updateField("freeDeliveryFrom", e.target.value)} placeholder="500" />
        </div>
        <div className="mt-4">
          <TextareaField label="Texte affiché au client" value={form.deliveryNote} onChange={(e) => updateField("deliveryNote", e.target.value)} placeholder="Message livraison" />
        </div>
        <div className="mt-4">
          <ToggleField label="Confirmation téléphonique" description="Activer la confirmation par téléphone avant livraison" checked={form.phoneConfirmation} onChange={(val) => updateField("phoneConfirmation", val)} />
        </div>
      </Card>
    </div>
  );
}