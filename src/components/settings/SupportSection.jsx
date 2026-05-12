import { MessageSquare, Mail, Phone, ShieldCheck } from "lucide-react";
import { Card, InputField } from "../SettingsUI";

export default function SupportSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Support client" subtitle="Règle les informations de contact du support">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="WhatsApp" icon={MessageSquare} value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="+212..." />
          <InputField label="Email support" icon={Mail} value={form.supportEmail} onChange={(e) => updateField("supportEmail", e.target.value)} placeholder="support@..." />
          <InputField label="Téléphone support" icon={Phone} value={form.supportPhone} onChange={(e) => updateField("supportPhone", e.target.value)} placeholder="+212..." />
          <InputField label="Horaires de disponibilité" icon={ShieldCheck} value={form.supportHours} onChange={(e) => updateField("supportHours", e.target.value)} placeholder="Lundi - Vendredi ..." />
        </div>
      </Card>
    </div>
  );
}