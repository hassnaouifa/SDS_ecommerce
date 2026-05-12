import React, { useState, useEffect, useRef } from 'react';
import { FaRegEdit, FaSearch, FaUsers, FaUser, FaStar, FaTimes, FaUserPlus, FaInbox } from 'react-icons/fa';

const ODOO_BASE_URL = 'http://localhost:8069';

// 👈 On s'assure de bien recevoir activeView et onShowInbox dans les props
const ChatSidebar = ({ activeView, activeChannel, onSelectChat, onShowStarred, onShowInbox, targetChannelId }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS POUR LA RECHERCHE ---
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- ÉTATS POUR LA MODALE "NOUVELLE CONVERSATION" ---
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); 
  const lastProcessedTargetId = useRef(null);

  const fetchChannels = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await fetch('/odoo-api/api/chat/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ params: {} }) 
      });
      const data = await response.json();
      if (data.result?.success) {
        setChannels(data.result.data);
      }
    } catch (error) { console.error("Erreur Sidebar :", error); }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(() => fetchChannels(true), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (channels.length > 0 && targetChannelId && lastProcessedTargetId.current !== targetChannelId) {
      const channelToOpen = channels.find(c => c.id === Number(targetChannelId)); 
      
      if (channelToOpen) {
        onSelectChat(channelToOpen); 
        lastProcessedTargetId.current = targetChannelId; 
      }
    }
  }, [channels, targetChannelId]);


  // --- LOGIQUE NOUVELLE CONVERSATION ---
  const handleOpenNewChatModal = async () => {
    setShowNewChatModal(true);
    setLoadingUsers(true);
    setSelectedUserId(null);
    setUserSearchQuery("");
    
    try {
      const response = await fetch('/odoo-api/api/chat/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ params: {} }) 
      });
      const data = await response.json();
      if (data.result?.success) {
        setUsersList(data.result.data);
      }
    } catch (error) { console.error("Erreur Fetch Users :", error); }
    setLoadingUsers(false);
  };

  const handleCreateNewChat = async () => {
    if (!selectedUserId) return;
    try {
      const response = await fetch('/odoo-api/api/chat/channel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ params: { partner_id: selectedUserId } }) 
      });
      const data = await response.json();
      if (data.result?.success) {
        setShowNewChatModal(false);
        fetchChannels();
        onSelectChat(data.result.data);
      }
    } catch (error) { console.error("Erreur Create Chat :", error); }
  };

  // --- RECHERCHE DYNAMIQUE DES CHATS EXISTANTS ---
  const filteredChannels = channels.filter(c => 
    c.chat_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChannelItem = (channel) => {
    const displayName = channel.chat_name || 'En attente...';
    const showBadge = channel.unread_count > 0 && activeChannel?.id !== channel.id;

    return (
      <div 
        key={channel.id} 
        onClick={() => onSelectChat(channel)}
        className={`flex items-center p-3 rounded-2xl cursor-pointer transition mb-1 ${
          activeChannel?.id === channel.id ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-gray-50'
        }`}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-200">
          <img 
            src={`${ODOO_BASE_URL}${channel.avatar}`} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = displayName.charAt(0).toUpperCase(); }}
            alt="avatar"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h6 className={`text-sm font-bold truncate ${showBadge ? 'text-black' : 'text-gray-800'}`}>
            {displayName}
          </h6>
          <p className={`text-xs truncate ${showBadge ? 'text-[#21a550] font-bold' : 'text-gray-500'}`}>
            {channel.channel_type === 'chat' ? 'Discussion privée' : 'Groupe'}
          </p>
        </div>

        {showBadge && (
          <div className="ml-2 flex-shrink-0">
            <div className="w-6 h-6 bg-[#21a550] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
              {channel.unread_count}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[360px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0 h-full relative">
      
      {/* --- HEADER --- */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Messages</h1>
          
          {/* 👈 LES ICÔNES SONT TOUTES ICI MAINTENANT */}
          <div className="flex gap-4 text-gray-400">
            <FaInbox 
              onClick={onShowInbox} 
              className={`cursor-pointer hover:scale-110 transition-all ${activeView === 'inbox' ? 'text-blue-600' : 'hover:text-blue-600'}`} 
              size={18} title="Boîte de réception" 
            />
            <FaStar 
              onClick={onShowStarred} 
              className={`cursor-pointer hover:scale-110 transition-all ${activeView === 'starred' ? 'text-yellow-400' : 'hover:text-yellow-400'}`} 
              size={18} title="Voir les messages favoris" 
            />
            <FaRegEdit 
              onClick={handleOpenNewChatModal}
              className="cursor-pointer hover:text-blue-600 hover:scale-110 transition-all" 
              size={18} title="Nouvelle discussion" 
            />
            <FaSearch 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery(""); 
              }}
              className={`cursor-pointer hover:scale-110 transition-all ${showSearch ? 'text-blue-600' : 'hover:text-blue-600'}`} 
              size={18} title="Rechercher" 
            />
          </div>
        </div>

        {/* BARRE DE RECHERCHE DÉROULANTE */}
        <div className={`transition-all duration-300 overflow-hidden ${showSearch ? 'max-h-20 mt-4' : 'max-h-0'}`}>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher une discussion..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- LISTE DES DISCUSSIONS (Le gros bouton bleu a été retiré) --- */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {loading ? (
          <div className="text-center text-gray-400 mt-10 text-sm">Chargement...</div>
        ) : (
          <>
            <div>
              <div className="text-xs text-gray-400 font-medium flex items-center gap-2 mb-3 px-2 uppercase tracking-wider">
                <FaUsers size={12} /> Groupes
              </div>
              {filteredChannels.filter(c => c.channel_type !== 'chat').map(renderChannelItem)}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium flex items-center gap-2 mb-3 px-2 uppercase tracking-wider">
                <FaUser size={12} /> Privé
              </div>
              {filteredChannels.filter(c => c.channel_type === 'chat').map(renderChannelItem)}
            </div>
            
            {filteredChannels.length === 0 && (
              <div className="text-center text-gray-400 mt-6 text-sm">Aucune discussion ne correspond à "{searchQuery}".</div>
            )}
          </>
        )}
      </div>

      {/* --- MODALE : CRÉER UN CHAT --- */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Créer un chat</h2>
              <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-gray-700 transition">
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6 pb-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <FaUserPlus size={14} /> Inviter des gens
              </label>
              <input 
                type="text" 
                placeholder="Rechercher des personnes à inviter" 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[40vh] p-4">
              {loadingUsers ? (
                <div className="text-center py-8 text-gray-400 text-sm">Chargement des contacts...</div>
              ) : (
                usersList
                  .filter(u => u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()))
                  .map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedUserId(user.id)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition mb-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                          <img src={`${ODOO_BASE_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">{user.name}</span>
                          <span className="text-gray-400 text-xs">{user.email || 'Aucun email'}</span>
                        </div>
                      </div>
                      
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedUserId === user.id ? 'bg-[#1b67ff] border-[#3765f0]' : 'border-gray-300'
                      }`}>
                        {selectedUserId === user.id && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={handleCreateNewChat}
                disabled={!selectedUserId}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  selectedUserId ? 'bg-[#131ef2] text-white hover:bg-[#575af9]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Créer un chat
              </button>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ChatSidebar;