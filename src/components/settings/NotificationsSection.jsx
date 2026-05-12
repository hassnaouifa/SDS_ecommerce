import { Mail } from "lucide-react";
import { Card, InputField, TextareaField } from "../SettingsUI";

export default function NotificationsSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Notifications" subtitle="Définis les emails et messages automatiques">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Email commandes" icon={Mail} value={form.orderEmail} onChange={(e) => updateField("orderEmail", e.target.value)} placeholder="commandes@..." />
          <InputField label="Email devis" icon={Mail} value={form.quoteEmail} onChange={(e) => updateField("quoteEmail", e.target.value)} placeholder="devis@..." />
        </div>
        <div className="mt-4">
          <TextareaField label="Message automatique" value={form.autoReplyMessage} onChange={(e) => updateField("autoReplyMessage", e.target.value)} placeholder="Message envoyé automatiquement" />
        </div>
      </Card>
    </div>
  );
}