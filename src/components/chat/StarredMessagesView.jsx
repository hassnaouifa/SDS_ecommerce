import React, { useState, useEffect } from 'react';
import { FaStar, FaSpinner } from 'react-icons/fa';

const ODOO_BASE_URL = import.meta.env.VITE_ODOO_BASE_URL || '';

const StarredMessagesView = () => {
  const [starredMessages, setStarredMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarredMessages = async () => {
      try {
        const response = await fetch('/odoo-api/api/chat/starred/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ params: {} })
        });
        const data = await response.json();
        if (data.result?.success) {
          setStarredMessages(data.result.data);
        }
      } catch (error) {
        console.error("Erreur Favoris :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStarredMessages();
  }, []);

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-[#FDFDFD] relative">
      
      {/* HEADER FAVORIS */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-100 bg-white">
        <FaStar className="text-yellow-400 text-2xl" />
        <h1 className="text-xl font-bold text-gray-900">Messages marqués d'une étoile</h1>
      </div>

      {/* LISTE DES MESSAGES */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        {loading ? (
          <div className="flex justify-center mt-10 text-blue-500">
            <FaSpinner className="animate-spin text-3xl" />
          </div>
        ) : starredMessages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <FaStar className="mx-auto text-4xl mb-4 text-gray-200" />
            <p>Aucun message favori pour le moment.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {starredMessages.map((msg) => (
              <div key={msg.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition hover:shadow-md">
                
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                  <img 
                    src={`${ODOO_BASE_URL}${msg.avatar}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    alt="avatar"
                  />
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-bold text-gray-900">{msg.author_name}</span>
                    <span className="text-xs text-gray-400">{msg.date}</span>
                    <span className="text-xs text-blue-500 font-medium ml-1">
                      (dans <span className="hover:underline cursor-pointer">{msg.channel_name}</span>)
                    </span>
                  </div>

                  {/* La bulle de message avec l'étoile */}
                  <div className="relative inline-block bg-[#F3F6FD] text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none mt-1">
                    <div dangerouslySetInnerHTML={{ __html: msg.body }} className="text-sm" />
                    
                    {/* Petite étoile jaune en bas à gauche de la bulle, comme sur ton image */}
                    <div className="absolute -bottom-2 -left-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                      <FaStar className="text-yellow-400 text-[10px]" />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarredMessagesView;