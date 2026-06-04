import { Building2, Mail, Phone, MapPin, Upload } from "lucide-react";
import { Card, InputField, SelectField } from "../SettingsUI";

export default function GeneralSection({ form, updateField }) {
  return (
    <div className="space-y-5">
      <Card title="Informations de la Société" subtitle="Configurez les paramètres généraux du site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Nom de la société" 
            icon={Building2} 
            value={form.siteName || ""} 
            onChange={(e) => updateField("siteName", e.target.value)} 
          />
          <InputField 
            label="Email" 
            icon={Mail} 
            value={form.siteEmail || ""} 
            onChange={(e) => updateField("siteEmail", e.target.value)} 
          />
          <InputField 
            label="Téléphone" 
            icon={Phone} 
            value={form.sitePhone || ""} 
            onChange={(e) => updateField("sitePhone", e.target.value)} 
          />
          <InputField 
            label="Adresse Complète" 
            icon={MapPin} 
            value={form.siteAddress || ""} 
            onChange={(e) => updateField("siteAddress", e.target.value)} 
          />
          <SelectField 
            label="Langue du système" 
            value={form.language || ""} 
            onChange={(e) => updateField("language", e.target.value)} 
            options={[
              { value: "fr_FR", label: "Français" }, 
              { value: "ar_001", label: "Arabe" }, 
              { value: "en_US", label: "Anglais" }
            ]} 
          />
          <InputField 
            label="Devise principale" 
            icon={Building2} 
            value={form.currency || ""} 
            disabled={true} // Généralement, on ne modifie pas la devise sans faire d'écritures comptables
            title="Modifiable uniquement via les paramètres comptables Odoo"
          />
        </div>
      </Card>
    </div>
  );
}