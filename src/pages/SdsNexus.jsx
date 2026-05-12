import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Calendar, User, Eye, X, MapPin, Mail, Phone, 
  MessageSquare, ChevronDown, Network, Building2, Briefcase
} from "lucide-react";
import api from "../api/axios";

// --- DICTIONNAIRES ---
const DEPLOYMENT_LABELS = {
  'cloud': 'Cloud',
  'dedicated_server': 'Serveur dédié',
  'local': 'Locale', // Raccourci pour gagner de la place visuellement
  'not_defined': 'Non défini'
};

const SIZE_LABELS = {
  '1_10': '1 à 10 employés',
  '11_50': '11 à 50 employés',
  '51_200': '51 à 200 employés',
  '200_plus': 'Plus de 200 employés'
};

// --- DROPDOWN SUR MESURE POUR L'ÉTAT ---
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statuses = [
    { value: 'new', label: 'Nouvelle', color: 'text-[#4f46ff] bg-[#f1efff]', hover: 'hover:bg-[#e4e1ff]' },
    { value: 'contacted', label: 'Contactée', color: 'text-amber-600 bg-amber-50', hover: 'hover:bg-amber-100' },
    { value: 'done', label: 'Traitée', color: 'text-emerald-600 bg-emerald-50', hover: 'hover:bg-emerald-100' }
  ];

  const current = statuses.find(s => s.value === currentStatus) || statuses[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full max-w-[105px] px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold transition-colors ${current.color}`}
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown size={14} className={`shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-[120px] rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 right-0 sm:left-0">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                onStatusChange(status.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[11px] font-semibold transition-colors ${status.color.split(' ')[0]} ${status.hover}`}
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
export default function SdsNexus() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/sds_nexus/demandes', { params: {} });
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
      setDemandes(demandes.map(d => d.id === id ? { ...d, state: newStatus } : d));
      await api.post('/api/sds_nexus/update_status', { 
        params: { request_id: id, new_status: newStatus } 
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const filteredDemandes = demandes.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-[#fafafc] min-h-screen relative">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#10174f] flex items-center gap-3">
            <Network className="text-[#4f46ff]" size={28} /> SDS Nexus
          </h1>
          <p className="text-slate-500 text-[14px] mt-1">Gérez les demandes de démonstration.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6 border border-[#ececf5]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, entreprise, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-[#4f46ff]/20 transition-all"
          />
        </div>
      </div>

      {/* --- TABLEAU RÉAJUSTÉ POUR NE PAS SE CHEVAUCHER --- */}
      <div className="bg-white rounded-[16px] border border-[#ececf5] shadow-sm pb-12">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#ececf5]">
              {/* Ajustement ultra-précis des pourcentages */}
              <th className="w-[11%] px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="w-[16%] px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nom Complet</th>
              <th className="w-[14%] px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entreprise</th>
              <th className="w-[20%] px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="w-[12%] px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</th>
              <th className="w-[11%] px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
              <th className="w-[6%] pr-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Détails</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">Chargement...</td></tr>
            ) : filteredDemandes.length > 0 ? (
              filteredDemandes.map((demande) => (
                <tr key={demande.id} className="border-b border-[#ececf5] hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500 truncate" title={demande.date}>
                      <Calendar size={13} className="shrink-0 text-slate-400" /> {demande.date.split(',')[0]}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-[#10174f] truncate" title={demande.name}>{demande.name}</td>
                  <td className="px-3 py-4 text-[13px] text-slate-700 font-medium truncate" title={demande.company_name}>{demande.company_name}</td>
                  <td className="px-3 py-4 text-[13px] text-slate-600 truncate" title={demande.email}>{demande.email}</td>
                  <td className="px-3 py-4 text-[13px] text-slate-600 truncate" title={demande.phone}>{demande.phone}</td>
                  <td className="px-3 py-4">
                    <StatusDropdown 
                      currentStatus={demande.state} 
                      onStatusChange={(newStatus) => handleStatusChange(demande.id, newStatus)} 
                    />
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedDemande(demande); setIsModalOpen(true); }}
                      className="text-[#4f46ff] bg-[#f1efff] p-1.5 rounded-[8px] hover:bg-[#4f46ff] hover:text-white transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">Aucune demande de démonstration.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- FENÊTRE MODALE --- */}
      {isModalOpen && selectedDemande && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 bg-white">
              <div>
                <h2 className="text-[20px] font-bold text-[#10174f]">Demande de démonstration</h2>
                <p className="text-[13px] text-slate-500 mt-1">Reçue le {selectedDemande.date}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-[#10174f] bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <h3 className="text-[12px] font-bold text-[#4f46ff] uppercase tracking-widest mb-4">Informations de contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8 bg-slate-50/50 p-6 rounded-[20px] border border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Nom Complet</span>
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#10174f]"><User size={15} className="text-slate-400"/> {selectedDemande.name}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-600"><Mail size={15} className="text-slate-400"/> {selectedDemande.email}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Téléphone</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-600"><Phone size={15} className="text-slate-400"/> {selectedDemande.phone}</div>
                </div>
              </div>

              <h3 className="text-[12px] font-bold text-[#4f46ff] uppercase tracking-widest mb-4">Profil de l'entreprise & Projet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Entreprise</span>
                  <div className="flex items-center gap-2 text-[15px] font-bold text-[#10174f]"><Building2 size={16} className="text-[#4f46ff]"/> {selectedDemande.company_name}</div>
                </div>
                <div className="border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Secteur d'activité</span>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-slate-700"><Briefcase size={15} className="text-slate-400"/> {selectedDemande.activity}</div>
                </div>
                <div className="border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Taille de l'entreprise</span>
                  <div className="text-[14px] font-medium text-slate-700">{selectedDemande.company_size ? SIZE_LABELS[selectedDemande.company_size] : 'Non spécifiée'}</div>
                </div>
                <div className="border border-slate-100 bg-white shadow-sm rounded-[16px] p-5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Déploiement souhaité</span>
                  <div className="text-[14px] font-medium text-slate-700">{DEPLOYMENT_LABELS[selectedDemande.deployment_mode]}</div>
                </div>
              </div>

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