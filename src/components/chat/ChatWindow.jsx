import React, { useState, useEffect, useRef } from 'react';
import { 
  FaEllipsisV, FaCheckDouble, FaCheck, 
  FaRegSmile, FaPaperclip, FaPaperPlane, FaRegCommentDots, 
  FaStar, FaTrash, FaEdit, FaTimes
} from 'react-icons/fa';

const ODOO_BASE_URL = 'http://localhost:8069';
const EMOJI_LIST = ['😀', '😂', '😍', '🙏', '👍', '🔥', '❤️', '🎉', '😊', '😎'];
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

const ChatWindow = ({ activeChannel, onToggleRightPanel, themeColor = { bgClass: 'bg-blue-600' }, searchQuery = '' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastMsgIdRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async (isBackground = false) => {
    if (!activeChannel) return;
    try {
      const response = await fetch('/odoo-api/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ params: { channel_id: activeChannel.id } })
      });
      const data = await response.json();
      
      if (data.result?.success) {
        const newMessagesList = data.result.data || [];
        setMessages(newMessagesList);
        
        if (newMessagesList.length > 0) {
          const latestMsg = newMessagesList[newMessagesList.length - 1];
          if (lastMsgIdRef.current && lastMsgIdRef.current !== latestMsg.id && !latestMsg.is_me) {
            const audio = new Audio(NOTIFICATION_SOUND_URL);
            audio.play().catch(e => console.log("Son bloqué", e));
          }
          lastMsgIdRef.current = latestMsg.id;
        }

        if (!isBackground) setTimeout(scrollToBottom, 100);
      }
    } catch (error) { console.error("Erreur Fetch Messages:", error); }
  };

  const filteredMessages = (messages || []).filter(msg => {
      if (!searchQuery) return true;
      const cleanBody = msg.body ? msg.body.replace(/<[^>]*>?/gm, '') : '';
      return cleanBody.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    setEditingMsgId(null);
    setAttachment(null);
    setShowEmojis(false);
    lastMsgIdRef.current = null; 
    
    if (activeChannel) {
      fetchMessages(false);
      const interval = setInterval(() => fetchMessages(true), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChannel]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !activeChannel) return;
    const currentText = newMessage;
    const currentAttachment = attachment;
    
    if (editingMsgId) {
      handleAction('edit', editingMsgId, currentText);
      setEditingMsgId(null);
      setNewMessage('');
      return;
    }

    setNewMessage(''); 
    setAttachment(null);
    setShowEmojis(false);

    try {
      const payload = { 
        channel_id: activeChannel.id, body: currentText,
        file_name: currentAttachment ? currentAttachment.name : null,
        file_data: currentAttachment ? currentAttachment.data : null
      };
      const response = await fetch('/odoo-api/api/chat/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ params: payload })
      });
      const data = await response.json();
      if (data.result?.success) {
        setMessages(prev => [...prev, data.result.data]);
        lastMsgIdRef.current = data.result.data.id; 
        setTimeout(scrollToBottom, 50);
      }
    } catch (error) { console.error("Erreur Send:", error); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setAttachment({ name: file.name, data: base64Data, previewUrl: reader.result });
    };
  };

  const handleAction = async (action, msgId, newBody = '') => {
    try {
      const response = await fetch('/odoo-api/api/chat/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ params: { action, message_id: msgId, body: newBody } })
      });
      const data = await response.json();
      if (data.result?.success) {
        if (action === 'delete') setMessages(prev => prev.filter(m => m.id !== msgId));
        else if (action === 'star') setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_starred: data.result.is_starred } : m));
        else if (action === 'edit') setMessages(prev => prev.map(m => m.id === msgId ? { ...m, body: data.result.new_body } : m));
      }
    } catch (error) { console.error(error); }
  };

  if (!activeChannel) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFDFD]">
      <FaRegCommentDots className="text-gray-200 mb-4" size={48} />
      <h2 className="text-xl font-bold text-gray-400">Sélectionnez une conversation</h2>
    </div>
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-[#FDFDFD] relative">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all" onClick={onToggleRightPanel}>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-white shadow-sm border border-gray-100">
            <img src={`${ODOO_BASE_URL}${activeChannel.avatar}`} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = activeChannel.chat_name.charAt(0).toUpperCase(); }}/>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{activeChannel.chat_name}</h2>
            <p className="text-xs font-medium text-gray-400">Cliquez pour voir les détails</p>
          </div>
        </div>


      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatContainerRef}>
        {filteredMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'} group mb-2`}>
            {!msg.is_me && <img src={`${ODOO_BASE_URL}${msg.avatar}`} className="w-8 h-8 rounded-full self-end mb-1 mr-2 object-cover shadow-sm" onError={(e) => { e.target.style.display = 'none'; }}/>}
            <div className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'} max-w-[75%]`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                {!msg.is_me && <span className="text-[11px] font-bold text-gray-500">{msg.author_name}</span>}
                <span className="text-[10px] text-gray-400">{msg.date}</span>
                {msg.is_me && (msg.is_read ? <FaCheckDouble className="text-blue-500" size={10} /> : <FaCheck className="text-gray-300" size={10} />)}
              </div>

              <div className={`relative p-3 px-4 text-sm shadow-sm transition-all break-words ${
                msg.is_me ? `${themeColor.bgClass} text-white rounded-2xl rounded-tr-none` : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none'
              } ${editingMsgId === msg.id ? 'ring-2 ring-yellow-400' : ''}`}>
                
                {msg.attached_image && <img src={`${ODOO_BASE_URL}${msg.attached_image}`} className="rounded-lg mb-2 max-h-64 w-full object-cover cursor-pointer" alt="Pièce jointe" />}
                <div dangerouslySetInnerHTML={{ __html: msg.body }} />
                
                <div className={`absolute -top-8 ${msg.is_me ? 'right-0' : 'left-0'} flex gap-2 bg-white shadow-lg rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all border border-gray-50 z-20`}>
                   <button onClick={() => handleAction('star', msg.id)} title="Favoris" className={`${msg.is_starred ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110`}><FaStar size={12} /></button>
                   {msg.is_me && <button onClick={() => { setEditingMsgId(msg.id); setNewMessage(msg.body.replace(/<[^>]*>?/gm, '')); }} title="Modifier" className="text-gray-400 hover:text-blue-500 hover:scale-110"><FaEdit size={12} /></button>}
                   {msg.is_me && <button onClick={() => handleAction('delete', msg.id)} title="Supprimer" className="text-gray-400 hover:text-red-500 hover:scale-110"><FaTrash size={12} /></button>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {searchQuery && filteredMessages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">Aucun message ne correspond à "{searchQuery}".</div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex flex-col relative">
        {attachment && (
          <div className="mb-3 flex items-center gap-3 bg-gray-50 p-2 rounded-lg w-max border border-gray-200">
            <img src={attachment.previewUrl} alt="preview" className="h-10 w-10 object-cover rounded" />
            <span className="text-xs text-gray-600 truncate max-w-[150px]">{attachment.name}</span>
            <button onClick={() => setAttachment(null)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
          </div>
        )}
        {showEmojis && (
          <div className="absolute bottom-20 left-6 bg-white border border-gray-100 shadow-xl rounded-xl p-3 flex gap-2 z-50">
            {EMOJI_LIST.map(emoji => <span key={emoji} className="cursor-pointer text-xl hover:scale-125 transition" onClick={() => setNewMessage(prev => prev + emoji)}>{emoji}</span>)}
          </div>
        )}

        <div className="flex items-center gap-3 bg-[#F8F9FA] p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100">
          <input 
            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={editingMsgId ? "Modifiez votre message..." : "Écrivez un message..."} className="flex-1 bg-transparent border-none outline-none px-4 text-sm"
          />
          <FaRegSmile onClick={() => setShowEmojis(!showEmojis)} className="text-gray-400 cursor-pointer text-xl hover:text-yellow-500" />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <FaPaperclip onClick={() => fileInputRef.current.click()} className="text-gray-400 cursor-pointer text-xl mx-2 hover:text-blue-500" />
          
          <button onClick={handleSendMessage} className={`p-3 rounded-xl transition-all shadow-md ${newMessage.trim() || attachment ? (editingMsgId ? 'bg-yellow-500 text-white' : `${themeColor.bgClass} text-white`) : 'bg-gray-200 text-gray-400'}`}>
            {editingMsgId ? <FaCheck size={16} /> : <FaPaperPlane size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;