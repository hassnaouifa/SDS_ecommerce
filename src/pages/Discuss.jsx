import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatRightPanel from '../components/chat/ChatRightPanel';
import StarredMessagesView from '../components/chat/StarredMessagesView';
import InboxView from '../components/chat/InboxView';

const THEME_COLORS = [
  { name: 'Bleu', bgClass: 'bg-blue-600', textClass: 'text-blue-600' },
  { name: 'Violet', bgClass: 'bg-purple-600', textClass: 'text-purple-600' },
  { name: 'Vert', bgClass: 'bg-green-600', textClass: 'text-green-600' },
  { name: 'Rose', bgClass: 'bg-pink-500', textClass: 'text-pink-500' },
  { name: 'Orange', bgClass: 'bg-orange-500', textClass: 'text-orange-500' },
];

const Discuss = () => {
  const [activeChannel, setActiveChannel] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [activeView, setActiveView] = useState('inbox');
  const [chatColor, setChatColor] = useState(THEME_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sur mobile : true = on voit la sidebar, false = on voit le chat
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const location = useLocation();
  const targetChannelId = location.state?.targetChannelId;

  useEffect(() => {
    if (activeChannel) {
      const savedColor = localStorage.getItem(`chat_color_${activeChannel.id}`);
      if (savedColor) {
        const found = THEME_COLORS.find(c => c.name === savedColor);
        setChatColor(found || THEME_COLORS[0]);
      } else {
        setChatColor(THEME_COLORS[0]);
      }
    }
  }, [activeChannel]);

  const handleColorChange = (newColor) => {
    setChatColor(newColor);
    if (activeChannel) localStorage.setItem(`chat_color_${activeChannel.id}`, newColor.name);
  };

  const handleSelectChat = (channel) => {
    setActiveChannel(channel);
    setActiveView('chat');
    setShowRightPanel(false);
    setSearchQuery('');
    setShowMobileSidebar(false); // Sur mobile : cacher la sidebar, montrer le chat
  };

  const handleShowInbox = () => {
    setActiveView('inbox');
    setActiveChannel(null);
    setShowRightPanel(false);
    setShowMobileSidebar(false); // Afficher la vue inbox
  };

  const handleShowStarred = () => {
    setActiveView('starred');
    setActiveChannel(null);
    setShowRightPanel(false);
    setShowMobileSidebar(false);
  };

  const handleBackToSidebar = () => {
    setShowMobileSidebar(true);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] font-sans text-gray-800 overflow-hidden">

      {/* SIDEBAR — visible desktop toujours, mobile seulement si showMobileSidebar */}
      <div className={`
        ${showMobileSidebar ? 'flex' : 'hidden'} md:flex
        w-full md:w-auto flex-shrink-0
      `}>
        <ChatSidebar
          activeView={activeView}
          activeChannel={activeChannel}
          onSelectChat={handleSelectChat}
          onShowStarred={handleShowStarred}
          onShowInbox={handleShowInbox}
          targetChannelId={targetChannelId}
        />
      </div>

      {/* CONTENU PRINCIPAL — caché sur mobile si sidebar visible */}
      <div className={`
        ${showMobileSidebar ? 'hidden' : 'flex'} md:flex
        flex-1 min-w-0 flex-col
      `}>
        {/* Bouton retour mobile */}
        <button
          onClick={handleBackToSidebar}
          className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 text-[#4f46ff] font-semibold text-sm"
        >
          ← Retour aux conversations
        </button>

        <div className="flex flex-1 min-h-0">
          {activeView === 'inbox' && <InboxView />}
          {activeView === 'starred' && <StarredMessagesView />}
          {activeView === 'chat' && (
            <ChatWindow
              activeChannel={activeChannel}
              onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
              themeColor={chatColor}
              searchQuery={searchQuery}
            />
          )}

          {showRightPanel && activeView === 'chat' && (
            <ChatRightPanel
              activeChannel={activeChannel}
              onClose={() => setShowRightPanel(false)}
              currentColor={chatColor}
              onColorChange={handleColorChange}
              onSearch={setSearchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Discuss;