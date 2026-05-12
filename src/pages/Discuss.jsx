import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatRightPanel from '../components/chat/ChatRightPanel';
import StarredMessagesView from '../components/chat/StarredMessagesView';
import InboxView from '../components/chat/InboxView'; // 👈 1. Ajoute cet import

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
  const [activeView, setActiveView] = useState('inbox'); // 👈 2. Met 'inbox' par défaut au lieu de 'chat'
  
  const [chatColor, setChatColor] = useState(THEME_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState('');

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
    setActiveView('chat'); // Quand on clique sur un chat, on passe en mode 'chat'
    setShowRightPanel(false);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] font-sans text-gray-800 overflow-hidden">
      
      <ChatSidebar 
        activeView={activeView} // 👈 On passe la vue active pour styliser le bouton Inbox
        activeChannel={activeChannel} 
        onSelectChat={handleSelectChat} 
        onShowStarred={() => { setActiveView('starred'); setActiveChannel(null); setShowRightPanel(false); }}
        onShowInbox={() => { setActiveView('inbox'); setActiveChannel(null); setShowRightPanel(false); }} // 👈 Nouvelle action
        targetChannelId={targetChannelId}
      />
      
      {/* L'AFFICHAGE CONDITIONNEL */}
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
          activeChannel={activeChannel} onClose={() => setShowRightPanel(false)}
          currentColor={chatColor} onColorChange={handleColorChange} onSearch={setSearchQuery}             
        />
      )}
    </div>
  );
};

export default Discuss;