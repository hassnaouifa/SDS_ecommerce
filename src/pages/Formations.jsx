import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Loader2, Tag, Edit, Trash2, Plus, Eye, RefreshCw } from 'lucide-react';
import api from '../api/axios'; 

import ViewFormationModal from '../components/formations/modales/ViewFormationModal';
import EditFormationModal from '../components/formations/modales/EditFormationModal';
import AddFormationModal from '../components/formations/modales/AddFormationModal';

export default function Formations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // États pour les modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [viewingFormation, setViewingFormation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/formations/get', {
        jsonrpc: "2.0",
        params: {}
      });

      if (response.data.result?.success) {
        setFormations(response.data.result.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des formations :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormation = async (newFormationData) => {
    try {
      const response = await api.post('/api/formations/create', {
        jsonrpc: "2.0",
        params: newFormationData
      });

      if (response.data.result?.success) {
        setFormations([response.data.result.data, ...formations]);
        setIsAddModalOpen(false); 
        console.log("Succès :", response.data.result.message);
      } else {
        alert("Erreur lors de la création : " + response.data.result?.message);
      }
    } catch (error) {
      console.error("Erreur API :", error);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const extractTextFromHTML = (html) => {
    if (!html) return "Aucune description disponible.";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation de façon permanente ?")) {
      try {
        const response = await api.post('/api/formations/delete', {
          jsonrpc: "2.0",
          params: { id: id } 
        });

        if (response.data.result?.success) {
          setFormations(formations.filter(f => f.id !== id));
          console.log("Succès :", response.data.result.message);
        } else {
          alert("Erreur lors de la suppression : " + response.data.result?.message);
        }
      } catch (error) {
        console.error("Erreur réseau ou serveur :", error);
        alert("Une erreur est survenue lors de la tentative de suppression.");
      }
    }
  };

  const openEditModal = (formation) => {
    setEditingFormation(formation);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingFormation(null);
  };

  const handleSaveEdit = async (updatedFormation) => {
    try {
      const response = await api.post('/api/formations/update', {
        jsonrpc: "2.0",
        params: updatedFormation 
      });

      if (response.data.result?.success) {
        setFormations(formations.map(f => f.id === updatedFormation.id ? updatedFormation : f));
        closeEditModal();
        console.log("Succès :", response.data.result.message);
      } else {
        alert("Erreur lors de la sauvegarde : " + response.data.result?.message);
      }
    } catch (error) {
      console.error("Erreur réseau ou serveur :", error);
      alert("Une erreur est survenue lors de la communication avec le serveur.");
    }
  };

  const filteredFormations = formations.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full relative">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#10174f] flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#f1efff] flex items-center justify-center text-[#4f46ff]">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            Formations
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Gérez et consultez les formations de votre système.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* BARRE DE RECHERCHE */}
          <div className="relative w-full sm:w-auto min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ececf5] rounded-full focus:outline-none focus:border-[#4f46ff] focus:ring-1 focus:ring-[#4f46ff] transition-all text-sm shadow-sm"
            />
          </div>
          
          {/* BOUTON ACTUALISER */}
          <button 
            onClick={fetchFormations}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#10174f] hover:bg-slate-50 text-sm font-semibold rounded-full border border-[#ececf5] transition-colors shadow-sm whitespace-nowrap"
          >
            <RefreshCw size={16} strokeWidth={2.5} />
            Actualiser
          </button>

          {/* BOUTON AJOUTER */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46ff] hover:bg-[#3d36c2] text-white text-sm font-semibold rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={2.5} />
            Ajouter formation
          </button>
        </div>
      </div>

      {/* --- ÉTAT DE CHARGEMENT --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Loader2 className="animate-spin mb-4 text-[#4f46ff]" size={32} />
          <p>Chargement...</p>
        </div>
      ) : (
        /* --- GRILLE DES FORMATIONS --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormations.length > 0 ? (
            filteredFormations.map((formation) => (
              <div 
                key={formation.id} 
                onClick={() => setViewingFormation(formation)} 
                className="bg-white rounded-[16px] border border-[#ececf5] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative cursor-pointer"
              >
                {/* ACTIONS RAPIDES */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(formation); }}
                    className="p-2 bg-white text-[#4f46ff] hover:bg-[#f1efff] rounded-[8px] shadow-sm transition-colors"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(formation.id); }}
                    className="p-2 bg-white text-red-500 hover:bg-red-50 rounded-[8px] shadow-sm transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* IMAGE */}
                <div className="h-40 bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  {formation.image_128 ? (
                    <img 
                      src={`data:image/png;base64,${formation.image_128}`} 
                      alt={formation.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <BookOpen size={40} className="text-slate-200" />
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-[#10174f] shadow-sm uppercase tracking-wider">
                    <Tag size={12} className="text-[#4f46ff]" />
                    {Array.isArray(formation.categ_id) ? formation.categ_id[1] : 'Formation'}
                  </div>
                </div>

                {/* CONTENU DE LA CARTE */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-[16px] font-bold text-[#10174f] mb-3 leading-tight">
                    {formation.name}
                  </h3>
                  
                  <p className="text-slate-500 text-[13px] mb-4 line-clamp-3 flex-1 leading-relaxed">
                    {extractTextFromHTML(formation.description_ecommerce)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#ececf5] mt-auto">
                    <span className="text-xl font-black text-[#10174f]">
                      {formation.list_price ? `${formation.list_price.toFixed(2)} MAD` : 'Gratuit'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#4f46ff] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={14} /> Voir détails
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-[16px] border border-dashed border-slate-200">
              <BookOpen size={48} className="mx-auto mb-4 text-slate-200" strokeWidth={1.5} />
              <p className="font-medium text-slate-500">Aucune formation trouvée.</p>
            </div>
          )}
        </div>
      )}

      {/* --- APPEL DES MODALES ICI --- */}
      {viewingFormation && (
        <ViewFormationModal 
          formation={viewingFormation} 
          onClose={() => setViewingFormation(null)} 
        />
      )}
      {isAddModalOpen && (
        <AddFormationModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleCreateFormation} 
        />
      )}
      {isEditModalOpen && editingFormation && (
        <EditFormationModal 
          formation={editingFormation} 
          onClose={closeEditModal} 
          onSave={handleSaveEdit} 
        />
      )}

    </div>
  );
}