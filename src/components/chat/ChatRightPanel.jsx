import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, FaImage, FaSearch, FaPhoneAlt, FaVideo, FaSpinner 
} from 'react-icons/fa';

const ODOO_BASE_URL = 'http://localhost:8069';

// 🎨 Ajout de la liste des couleurs directement ici pour éviter l'erreur d'import !
const THEME_COLORS = [
  { name: 'Bleu', bgClass: 'bg-blue-600', textClass: 'text-blue-600' },
  { name: 'Violet', bgClass: 'bg-purple-600', textClass: 'text-purple-600' },
  { name: 'Vert', bgClass: 'bg-green-600', textClass: 'text-green-600' },
  { name: 'Rose', bgClass: 'bg-pink-500', textClass: 'text-pink-500' },
  { name: 'Orange', bgClass: 'bg-orange-500', textClass: 'text-orange-500' },
];

const ChatRightPanel = ({ activeChannel, onClose, currentColor, onColorChange, onSearch }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sharedImages, setSharedImages] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  
  // États pour nos nouveaux menus
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const searchInputRef = useRef(null);

  // Le Hook magique pour aller chercher les vraies données
  useEffect(() => {
    const fetchChannelMedia = async () => {
      if (!activeChannel) return;
      
      setLoadingMedia(true);
      try {
        const response = await fetch('/odoo-api/api/chat/channel/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ params: { channel_id: activeChannel.id } })
        });
        const data = await response.json();
        
        if (data.result?.success) {
          setSharedImages(data.result.data); // On sauvegarde les vraies images
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médias:", error);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchChannelMedia();
  }, [activeChannel]);

  // Fonction pour les notifications
  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    console.log("Notifications activées : ", newState);
  };

  // Quand on clique sur recherche, on met le focus sur l'input
  const handleSearchClick = () => {
    setIsSearching(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // Envoie au parent !
  };

  if (!activeChannel) return null;

  const displayName = activeChannel.chat_name || 'Sans nom';
  const isGroup = activeChannel.channel_type !== 'chat';

  // Petite sécurité au cas où currentColor n'est pas encore défini
  const safeCurrentColor = currentColor || THEME_COLORS[0];

  return (
    <div className="w-[320px] bg-white border-l border-gray-100 flex flex-col flex-shrink-0 shadow-lg overflow-hidden z-10">
      
      {/* 🛑 Bouton Fermer */}
      <div className="p-4 flex justify-end items-center">
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
        >
          <FaTimes size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        
        {/* 👤 Section Profil */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden text-white shadow-md mb-3 text-3xl font-bold ring-4 ring-offset-2 ring-blue-50">
             <img 
                src={`${ODOO_BASE_URL}${activeChannel.avatar}`} 
                className="w-full h-full object-cover" 
                alt="Avatar Details"
                onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.parentNode.innerHTML = displayName.charAt(0).toUpperCase(); 
                }}
             />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">{displayName}</h2>
          <p className="text-xs text-gray-400 mt-1">{isGroup ? 'Groupe actif' : 'En ligne maintenant'}</p>
          

        </div>

        {/* ⚙️ Section Paramètres */}
        <div className="space-y-4 mb-8 border-t border-b border-gray-100 py-5">
          
          {/* 🔍 1. FONCTION RECHERCHE */}
          {isSearching ? (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-blue-200 transition-all">
              <FaSearch className="text-gray-400 ml-1" size={14} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher un message..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={handleSearchChange}
                // Si on clique ailleurs et que c'est vide, on referme
                onBlur={() => { if(!searchTerm) setIsSearching(false); }}
              />
              {searchTerm && (
                <FaTimes className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => {setSearchTerm(''); onSearch('');}} />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-gray-700 hover:text-blue-600 cursor-pointer transition-colors" onClick={handleSearchClick}>
              <span className="text-sm font-medium">Recherche dans la conversation</span>
              <FaSearch size={14} className="text-gray-400" />
            </div>
          )}

          {/* 🎨 2. CHANGEMENT DE COULEUR */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-gray-700 hover:text-blue-600 cursor-pointer transition-colors" onClick={() => setShowColorPicker(!showColorPicker)}>
              <span className="text-sm font-medium">Changer la couleur</span>
              <div className={`w-5 h-5 rounded-full shadow-sm ${safeCurrentColor.bgClass}`}></div>
            </div>
            
            {/* Palette de couleurs qui s'ouvre */}
            {showColorPicker && (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fade-in">
                {THEME_COLORS.map((color) => (
                  <button 
                    key={color.name}
                    onClick={() => { onColorChange(color); setShowColorPicker(false); }}
                    title={color.name}
                    className={`w-7 h-7 rounded-full shadow-sm transition-all hover:scale-110 ${color.bgClass} ${safeCurrentColor.name === color.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>



        </div>

        {/* 🖼️ Section Vraies Photos partagées */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <FaImage size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Photos partagées</span>
            </div>
            <span className="text-xs font-bold text-gray-300">{sharedImages.length}</span>
          </div>
          
          {loadingMedia ? (
            <div className="flex justify-center items-center py-6 text-blue-500">
              <FaSpinner className="animate-spin" size={24} />
            </div>
          ) : sharedImages.length > 0 ? (
            <>
              {/* Grille dynamique avec les VRAIES images */}
              <div className="grid grid-cols-4 gap-2">
                {sharedImages.map((img) => (
                  <div key={img.id} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-100 shadow-sm">
                    <img 
                      src={`${ODOO_BASE_URL}${img.url}`} 
                      alt={`shared-${img.id}`} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                ))}
              </div>
              {sharedImages.length >= 20 && (
                <div className="mt-5 text-center">
                  <button className="text-blue-500 hover:text-blue-700 text-sm font-bold transition-colors">
                    Voir plus
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl">
              Aucune photo partagée ici.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatRightPanel;