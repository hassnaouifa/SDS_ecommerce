import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Calendar, User, 
  GraduationCap, Eye, X, MapPin, Mail, Phone, Hash, MessageSquare, ChevronDown
} from "lucide-react";
import api from "../api/axios";

// --- NOUVEAU COMPOSANT : DROPDOWN SUR MESURE POUR L'ÉTAT ---
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statuses = [
    { value: 'draft', label: 'Pré-inscrit', color: 'text-amber-600 bg-amber-50', hover: 'hover:bg-amber-100' },
    { value: 'sale', label: 'Confirmée', color: 'text-emerald-600 bg-emerald-50', hover: 'hover:bg-emerald-100' },
    { value: 'cancel', label: 'Annulée', color: 'text-red-600 bg-red-50', hover: 'hover:bg-red-100' }
  ];

  const current = statuses.find(s => s.value === currentStatus) || statuses[0];

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 w-28 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${current.color}`}
      >
        <span>{current.label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-32 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 left-0">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                onStatusChange(status.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors ${status.color.split(' ')[0]} ${status.hover}`}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function FormationsDemande() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/orders/formations', { params: {} });
      if (response.data?.result?.success) {
        setDemandes(response.data.result.data);
      } else {
        setDemandes([]);
      }
    } catch (error) {
      console.error("Erreur :", error);
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Mise à jour visuelle instantanée
      setDemandes(demandes.map(d => d.id === id ? { ...d, status: newStatus } : d));
      
      // Envoi au backend Odoo
      await api.post('/api/orders/formations/update_status', { 
        params: { order_id: id, new_status: newStatus } 
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const filteredDemandes = demandes.filter(d => 
    d.client?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.formation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ref?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-[#fafafc] min-h-screen relative">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#10174f] flex items-center gap-3">
            <GraduationCap className="text-[#4f46ff]" size={28} /> Réservations de Formations
          </h1>
          <p className="text-slate-500 text-[14px] mt-1">Gérez les inscriptions des participants.</p>
        </div>
      </div>

      {/* RECHERCHE */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6 border border-[#ececf5]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un participant, une réf..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-[#4f46ff]/20 transition-all"
          />
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[16px] border border-[#ececf5] overflow-visible"> {/* overflow-visible important pour le dropdown */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#ececf5]">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Réf</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Participant</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Formation</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">État</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Détails</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
              ) : filteredDemandes.length > 0 ? (
                filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="border-b border-[#ececf5] hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-[14px] font-semibold text-[#10174f]">{demande.ref}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-700 font-medium">{demande.client}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">{demande.formation}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px] text-slate-500">
                        <Calendar size={14} /> {demande.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* INTÉGRATION DU NOUVEAU DROPDOWN ICI */}
                      <StatusDropdown 
                        currentStatus={demande.status} 
                        onStatusChange={(newStatus) => handleStatusChange(demande.id, newStatus)} 
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedDemande(demande); setIsModalOpen(true); }}
                        className="text-[#4f46ff] bg-[#f1efff] p-2 rounded-lg hover:bg-[#4f46ff] hover:text-white transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Aucune réservation trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FENÊTRE MODALE VISUELLE */}
      {isModalOpen && selectedDemande && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 bg-white">
              <div>
                <h2 className="text-[20px] font-bold text-[#10174f]">Détails de la réservation</h2>
                <p className="text-[13px] text-slate-500 mt-1">Réf: {selectedDemande.ref} • Effectuée le {selectedDemande.date}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-[#10174f] bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {/* Infos Participant */}
              <h3 className="text-[12px] font-bold text-[#4f46ff] uppercase tracking-widest mb-4">Profil Participant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8 bg-slate-50/50 p-6 rounded-[20px] border border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Nom Complet</span>
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#10174f]"><User size={15} className="text-slate-400"/> {selectedDemande.client}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-600"><Mail size={15} className="text-slate-400"/> {selectedDemande.email}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Téléphone</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-600"><Phone size={15} className="text-slate-400"/> {selectedDemande.telephone}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Ville</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-600"><MapPin size={15} className="text-slate-400"/> {selectedDemande.ville}</div>
                </div>
              </div>

              {/* Infos Formation */}
              <h3 className="text-[12px] font-bold text-[#4f46ff] uppercase tracking-widest mb-4">Choix de formation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="col-span-1 md:col-span-3 border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Formation demandée</span>
                  <div className="flex items-center gap-2 text-[16px] font-bold text-[#10174f]"><GraduationCap size={18} className="text-[#4f46ff]"/> {selectedDemande.formation}</div>
                </div>
                <div className="border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Places</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-700"><Hash size={15} className="text-slate-400"/> {selectedDemande.places} personne(s)</div>
                </div>
                <div className="col-span-2 border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Niveau</span>
                  <div className="text-[14px] font-medium text-slate-700">{selectedDemande.niveau}</div>
                </div>
              </div>

              {/* Message */}
              <h3 className="text-[12px] font-bold text-[#4f46ff] uppercase tracking-widest mb-4">Message / Besoins</h3>
              <div className="bg-[#f8f8fb] border border-[#ececf5] rounded-[16px] p-5 flex gap-4 text-[14px] text-slate-600">
                <MessageSquare size={20} className="text-[#4f46ff] shrink-0 mt-0.5" />
                <p className="leading-relaxed whitespace-pre-wrap">{selectedDemande.message}</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}