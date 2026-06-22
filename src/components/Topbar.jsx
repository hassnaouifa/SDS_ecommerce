import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, FileText } from "lucide-react";

import api from "../api/axios";

import ProfileModal from "./settings/ProfileModal";
import NotificationBell from "./notifications/NotificationBell";
import UserMenu from "./ui/UserMenu";
import QuoteModal from "./quotes/QuoteModal";
function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Topbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [topbarData, setTopbarData] = useState({
    user_name: "", user_email: "", balance: 0, avatar_url: "",
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const loadTopbar = async () => {
      try {
        const response = await api.post("/api/topbar", {});
        if (response.data.result?.success) {
          setTopbarData(prev => ({ ...prev, ...response.data.result.data }));
        }
      } catch (e) {
        console.error("Erreur topbar :", e);
      }
    };
    loadTopbar();
  }, []);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-6">

        {/* --- PARTIE GAUCHE --- */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Bouton retour — caché sur mobile pour gagner de la place */}
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:flex w-10 h-10 rounded-2xl bg-white border border-[#e9eaf4] items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Barre de recherche — s'étire sur mobile */}
          <div className="h-10 w-full max-w-[420px] bg-white border border-[#e9eaf4] rounded-full px-4 flex items-center gap-3">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* --- PARTIE DROITE --- */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

{/* Bouton Devis */}
<button
  onClick={() => setIsQuoteModalOpen(true)}
  className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-2xl bg-[#4f46ff] text-white text-sm font-semibold hover:bg-[#3d36e0] transition-colors shrink-0"
>
  <FileText size={16} />
  Nouveau devis
</button>

{/* Version icône seule pour mobile */}
<button
  onClick={() => setIsQuoteModalOpen(true)}
  className="sm:hidden flex w-10 h-10 rounded-2xl bg-[#4f46ff] text-white items-center justify-center shrink-0"
>
  <FileText size={18} />
</button>



          {/* Notifications */}
          <NotificationBell />

          {/* Solde — caché sur mobile */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-slate-400">Votre Solde</p>
            <p className="font-bold text-[#4f46ff]">
              {formatCurrency(topbarData.balance)}
            </p>
          </div>

          {/* Menu utilisateur */}
          <UserMenu
            userData={topbarData}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        </div>
      </div>

<QuoteModal
  isOpen={isQuoteModalOpen}
  onClose={() => setIsQuoteModalOpen(false)}
/>


      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={topbarData}
      />
    </>
  );
}