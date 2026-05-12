import { useEffect, useState } from "react";
import { Search, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 👈 Ajout de useNavigate
import api from "../api/axios";

// Import de nos composants fraichement découpés
import ProfileModal from "./settings/ProfileModal";
import NotificationBell from "./notifications/NotificationBell";
import UserMenu from "./ui/UserMenu";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Topbar() {
  const navigate = useNavigate(); // 👈 Initialisation de la navigation
  const [searchQuery, setSearchQuery] = useState(""); // 👈 État pour la recherche

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

  // 👈 Fonction pour gérer l'appui sur "Entrée"
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      // Modifie cette URL selon la route de recherche que tu as prévue dans ton AppRouter
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        
        {/* --- PARTIE GAUCHE (Recherche) --- */}
        <div className="flex items-center gap-4">
          {/* 👈 Ajout du onClick avec navigate(-1) pour retourner à la page précédente */}
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-2xl bg-white border border-[#e9eaf4] flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="h-12 w-full max-w-[420px] bg-white border border-[#e9eaf4] rounded-full px-4 flex items-center gap-3">
            <Search size={18} className="text-slate-400" />
            {/* 👈 Connexion de l'input au state et détection de la touche Entrée */}
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

        {/* --- PARTIE DROITE (Actions & Profil) --- */}
        <div className="flex items-center gap-4">
          
          {/* Composant de Notifications */}
          <NotificationBell />

          {/* Solde */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-slate-400">Votre Solde</p>
            <p className="font-bold text-[#4f46ff]">
              {formatCurrency(topbarData.balance)}
            </p>
          </div>

          {/* Composant Menu Utilisateur */}
          <UserMenu 
            userData={topbarData} 
            onOpenProfile={() => setIsProfileModalOpen(true)} 
          />

        </div>
      </div>

      {/* Composant Modale de Profil */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userData={topbarData}
      />
    </>
  );
}