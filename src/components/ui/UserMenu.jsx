import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import api from "../../api/axios";

export default function UserMenu({ userData, onOpenProfile }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/logout", {});
      navigate("/login");
    } catch (error) {
      console.error("Erreur logout :", error);
    }
  };

  const firstLetter = userData.user_name ? userData.user_name.charAt(0).toUpperCase() : "A";

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-3 bg-white border border-[#e9eaf4] rounded-full flex items-center gap-3 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
      >
        {userData.avatar_url ? (
          <img
            src={`/odoo-api${userData.avatar_url}`}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover bg-slate-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold">
            {firstLetter}
          </div>
        )}

        <div className="text-left">
          <p className="text-[#1f2557] font-semibold text-sm">
            {userData.user_name ? `Bonjour, ${userData.user_name}` : "Bonjour"}
          </p>
          {userData.user_email && (
            <p className="text-[11px] text-slate-400">{userData.user_email}</p>
          )}
        </div>

        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-[#e9eaf4] overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="p-4 border-b border-[#e9eaf4] bg-[#fafafe]">
            <p className="text-sm font-bold text-[#1f2557] truncate">
              {userData.user_name || "Utilisateur"}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {userData.user_email || "email@example.com"}
            </p>
          </div>
          
          <div className="p-2 space-y-1">
            <button
              onClick={() => { setIsOpen(false); onOpenProfile(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-[#fafafe] hover:text-[#4f46ff] transition-all"
            >
              <User size={18} />
              Mon Profil
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate("/settings"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-[#fafafe] hover:text-[#4f46ff] transition-all"
            >
              <Settings size={18} />
              Paramètres
            </button>
          </div>

          <div className="p-2 border-t border-[#e9eaf4]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-slate-500 font-medium px-3 py-2.5 rounded-[12px] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} strokeWidth={2} />
              <span className="text-[14px]">Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}