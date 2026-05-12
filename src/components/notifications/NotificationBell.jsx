import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Hash, Bot } from "lucide-react";
import api from "../../api/axios";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("notifications");
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(0);
  const [showAll, setShowAll] = useState(false); 
  const ref = useRef(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.post("/api/notifications", {});
        if (response.data.result?.success) {
          setMessages(response.data.result.data);
          setCount(response.data.result.count);
        }
      } catch (e) {
        console.error("Erreur notifications :", e);
      }
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
        setShowAll(false); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToMessages = () => {
    setIsOpen(false);
    navigate("/discuss");
  };

  const handleNotificationClick = (msg) => {
    setIsOpen(false);
    setShowAll(false);
    // On navigue vers la page globale des messages en passant l'ID caché
    navigate("/discuss", { state: { targetChannelId: msg.target_id } });
  };

  // 👈 NOUVEAU : Filtrage des messages en fonction de l'onglet actif
  const getFilteredMessages = () => {
    if (tab === "chats") {
      return messages.filter(msg => msg.avatar_type !== 'channel');
    } else if (tab === "canaux") {
      return messages.filter(msg => msg.avatar_type === 'channel');
    }
    return messages; // tab === "notifications" (affiche tout)
  };

  // On applique le filtre d'abord
  const filteredMessagesList = getFilteredMessages();
  // Puis on limite l'affichage
  const visibleMessages = showAll ? filteredMessagesList : filteredMessagesList.slice(0, 5);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isOpen ? 'bg-[#4f46ff] border-[#4f46ff] text-white shadow-lg shadow-indigo-200' : 'bg-white border-[#e9eaf4] text-[#1f2557] hover:bg-slate-50'}`}
      >
        <Bell size={18} />
      </button>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
          {count}
        </span>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[450px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e9eaf4] overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-5 pt-4 border-b border-[#e9eaf4] bg-[#fafafe]">
            <div className="flex gap-6">
              {/* Changement onClick : on réinitialise showAll quand on change d'onglet */}
              {["Notifications", "Chats", "Canaux"].map(t => (
                <button 
                  key={t} 
                  onClick={() => { setTab(t.toLowerCase()); setShowAll(false); }}
                  className={`pb-3 text-sm font-bold transition-all relative ${tab === t.toLowerCase() ? "text-[#4f46ff]" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {t}
                  {tab === t.toLowerCase() && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4f46ff] rounded-t-full"></span>}
                </button>
              ))}
            </div>
            <button onClick={goToMessages} className="pb-3 text-sm font-semibold text-[#4f46ff] hover:text-[#3d36d8] transition-colors">
              Nouveau message
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {filteredMessagesList.length > 0 ? (
              <>
                {visibleMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    onClick={() => handleNotificationClick(msg)}
                    className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-4 transition-colors"
                  >
                    <div className="relative shrink-0">
                      {msg.avatar_type === 'channel' ? (
                        <div className="w-12 h-12 rounded-xl bg-red-800 text-white flex items-center justify-center"><Hash size={24} /></div>
                      ) : msg.avatar_type === 'system' ? (
                        <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center"><Bot size={24} /></div>
                      ) : msg.avatar_url ? (
                        <img src={`${api.defaults.baseURL || 'http://localhost:8069'}${msg.avatar_url}`} className="w-12 h-12 rounded-xl object-cover bg-slate-200" alt="Avatar" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-400 text-white flex items-center justify-center font-bold text-lg">
                          {msg.sender ? msg.sender.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-[15px] font-bold text-[#1f2557] truncate pr-2">{msg.sender}</p>
                        <p className="text-xs font-semibold text-slate-500 whitespace-nowrap mt-0.5">{msg.time}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-slate-600 truncate pr-4">{msg.text}</p>
                        {msg.unread && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">1</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Bouton Afficher Tout ajusté pour la liste filtrée */}
                {!showAll && filteredMessagesList.length > 5 && (
                  <button 
                    onClick={() => setShowAll(true)}
                    className="w-full py-3 text-sm font-semibold text-[#4f46ff] hover:bg-slate-50 transition-colors text-center"
                  >
                    Afficher tout ({filteredMessagesList.length - 5} autres)
                  </button>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-sm font-medium text-slate-400">Aucune notification dans cet onglet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}