import { useEffect, useState } from "react";
import { X, Mail, Phone, HelpCircle } from "lucide-react";
import api from "../../api/axios";

export default function ProfileModal({ isOpen, onClose, userData }) {
  const [activeTab, setActiveTab] = useState("preferences");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [profileData, setProfileData] = useState({
    name: userData?.user_name || "Utilisateur",
    email: userData?.user_email || "email@example.com",
    phone: "",
    lang: "fr_FR",
    signature: "Smart Digital Systems",
    notification_type: "email",
    available_langs: [
      { code: "fr_FR", name: "Français" },
      { code: "en_US", name: "English" },
      { code: "ar_001", name: "العربية" }
    ]
  });

  useEffect(() => {
    if (isOpen) {
      setProfileData(prev => ({
        ...prev,
        name: userData?.user_name || prev.name,
        email: userData?.user_email || prev.email,
      }));
      fetchProfileData();
    }
  }, [isOpen, userData]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/profile/get", {});
      const result = response.data.result;
      if (result && result.success) {
        setProfileData(result.data); 
      }
    } catch (error) {
      console.error("Erreur chargement profil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await api.post("/api/profile/update", {
        params: {
          lang: profileData.lang,
          signature: profileData.signature,
          notification_type: profileData.notification_type,
          phone: profileData.phone
        }
      });
      
      const result = response.data.result;
      if (result && result.success) {
        setMessage({ text: "Profil mis à jour avec succès !", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: result?.message || "Erreur.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Erreur de connexion au serveur.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-[850px] rounded-[24px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e9eaf4]">
          <h2 className="text-xl font-bold text-[#1f2557]">Changer mes préférences</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4f46ff]"></div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="px-8 py-6 flex items-center gap-6">
              {userData?.avatar_url ? (
                <img
                  src={`/odoo-api${userData.avatar_url}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white outline outline-1 outline-[#e9eaf4]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4f46ff] to-[#6a5cff] text-white flex items-center justify-center text-4xl font-bold shadow-sm">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-[#1f2557]">{profileData.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-slate-500 font-medium text-sm">
                  <div className="flex items-center gap-2"><Mail size={16} />{profileData.email}</div>
                  <div className="flex items-center gap-2"><Phone size={16} />{profileData.phone || "Non renseigné"}</div>
                </div>
              </div>
            </div>

            <div className="px-8 border-b border-[#e9eaf4] flex gap-8">
              {["Préférences"].map((tab) => (
                <button key={tab} className="pb-4 text-sm font-bold text-[#4f46ff] relative">
                  {tab} <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4f46ff] rounded-t-full"></span>
                </button>
              ))}
            </div>

            <div className="p-8">
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1f2557]">Langue <HelpCircle size={14} className="text-slate-400" /></label>
                    <select name="lang" value={profileData.lang} onChange={handleChange} className="w-full h-11 bg-[#fafafe] border border-[#e9eaf4] rounded-xl px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#4f46ff] focus:ring-2 focus:ring-[#4f46ff]/20 cursor-pointer">
                      {profileData.available_langs.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1f2557]">Signature e-mail</label>
                    <textarea name="signature" value={profileData.signature} onChange={handleChange} rows="4" className="w-full bg-[#fafafe] border border-[#e9eaf4] rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-[#4f46ff] focus:ring-2 focus:ring-[#4f46ff]/20 resize-none" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1f2557]">Notifications <HelpCircle size={14} className="text-slate-400" /></label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="notification_type" value="email" checked={profileData.notification_type === 'email'} onChange={handleChange} className="w-4 h-4 text-[#4f46ff] cursor-pointer" />
                        <span className="text-sm font-medium text-slate-600">Par e-mails</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="notification_type" value="inbox" checked={profileData.notification_type === 'inbox'} onChange={handleChange} className="w-4 h-4 text-[#4f46ff] cursor-pointer" />
                        <span className="text-sm font-medium text-slate-600">Dans Odoo</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1f2557]">Téléphone</label>
                    <input type="text" name="phone" value={profileData.phone} onChange={handleChange} className="w-full h-11 bg-[#fafafe] border border-[#e9eaf4] rounded-xl px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#4f46ff] focus:ring-2 focus:ring-[#4f46ff]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-8 py-5 border-t border-[#e9eaf4] bg-[#fafafe] flex gap-4">
          <button onClick={handleSave} disabled={saving || loading} className="px-6 py-2.5 rounded-xl bg-[#4f46ff] hover:bg-[#3d36d8] text-white text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
            {saving ? "Sauvegarde..." : "Mettre à jour les préférences"}
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white border border-[#e9eaf4] hover:bg-slate-50 text-slate-600 text-sm font-bold">
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}