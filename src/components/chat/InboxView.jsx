import React, { useState, useEffect } from 'react';
import { FaInbox, FaSearch, FaRobot, FaCheckDouble, FaSpinner } from 'react-icons/fa';
import api from '../../api/axios';

const ODOO_BASE_URL = import.meta.env.VITE_ODOO_BASE_URL || '';

export default function InboxView() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false); // État pour le bouton de validation

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const response = await api.post('/api/chat/inbox', { params: {} });
        if (response.data?.result?.success) {
          setMessages(response.data.result.data);
        }
      } catch (error) {
        console.error("Erreur Inbox:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  // Fonction pour vider la boîte de réception
  const handleMarkAllAsRead = async () => {
    if (messages.length === 0) return;
    
    setIsMarkingRead(true);
    try {
      const response = await api.post('/api/chat/inbox/mark_read', { params: {} });
      if (response.data?.result?.success) {
        setMessages([]); // On vide la liste visuellement si c'est un succès
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] h-full relative">
      
      {/* HEADER ÉPURÉ */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200 bg-white shadow-sm z-10">
        <div className="flex items-center gap-3 text-gray-800">
          <div className="w-10 h-10 bg-[#f1efff] text-[#4f46ff] rounded-xl flex items-center justify-center">
            <FaInbox size={18} />
          </div>
          <h1 className="text-xl font-bold">Boîte de réception</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* BOUTON FONCTIONNEL */}
          <button 
            onClick={handleMarkAllAsRead}
            disabled={messages.length === 0 || isMarkingRead}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all border
              ${messages.length === 0 
                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
              }`}
          >
            {isMarkingRead ? (
              <><FaSpinner className="animate-spin" /> Validation...</>
            ) : (
              <><FaCheckDouble className="text-[#4f46ff]" /> Tout marquer comme lu</>
            )}
          </button>
          

        </div>
      </div>

      {/* ZONE DES MESSAGES */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-[#4f46ff]">
              <FaSpinner className="animate-spin" size={30} />
            </div>
          ) : messages.length > 0 ? (
            
            /* BLOC BLANC CONTENANT LA LISTE */
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {messages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start p-6 hover:bg-slate-50 transition-colors ${
                    index !== messages.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  
                  {/* Avatar avec style doux */}
                  <div className="w-12 h-12 rounded-xl shadow-sm border border-gray-100 overflow-hidden bg-[#10174f] flex items-center justify-center text-white shrink-0 mr-5">
                    {msg.avatar && msg.author_name !== 'OdooBot' ? (
                      <img src={`${ODOO_BASE_URL}${msg.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaRobot size={24} className="text-[#00E676]" /> 
                    )}
                  </div>

                  {/* Contenu du message */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    
                    {/* En-tête : Auteur + Référence + Date */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[15px] text-gray-900">{msg.author_name}</span>
                        {msg.record_name && (
                          <>
                            <span className="text-[13px] text-gray-400">•</span>
                            <span className="text-[13px] font-semibold text-[#4f46ff] bg-[#f1efff] px-2 py-0.5 rounded-md cursor-pointer hover:bg-[#e4e1ff] transition-colors">
                              {msg.record_name}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap ml-4">
                        {msg.date}
                      </span>
                    </div>
                    
                    {/* Sujet */}
                    {msg.subject && (
                      <p className="text-[13px] font-medium text-gray-500 mb-2">
                        {msg.subject}
                      </p>
                    )}
                    
                    {/* Corps du message */}
                    <div 
                      className="text-[14px] text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 inline-block min-w-full" 
                      dangerouslySetInnerHTML={{ __html: msg.body }} 
                    />
                    
                  </div>
                </div>
              ))}
            </div>
            
          ) : (
            
            /* ÉTAT VIDE (EMPTY STATE) ÉLÉGANT */
            <div className="flex flex-col items-center justify-center text-center mt-24 bg-white border border-gray-200 rounded-3xl p-12 shadow-sm">
              <div className="w-24 h-24 bg-[#f1efff] text-[#4f46ff] rounded-full flex items-center justify-center mb-6">
                <FaCheckDouble size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tout est en ordre !</h2>
              <p className="text-gray-500 max-w-md">
                Votre boîte de réception est vide. Vous avez lu toutes vos notifications et messages système.
              </p>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}