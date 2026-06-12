import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Loader2, AlertCircle,
  Mail, Phone, MapPin, X, Pencil, Trash2, CheckCircle
} from 'lucide-react';
import api from '../api/axios';

async function odooCall(model, method, args = [], kwargs = {}) {
  const res = await api.post('/web/dataset/call_kw', {
    jsonrpc: '2.0', method: 'call', id: 1,
    params: { model, method, args, kwargs }
  });
  if (res.data.error) throw new Error(res.data.error.data?.message || res.data.error.message);
  return res.data.result;
}

// ─── Modal Créer / Éditer ─────────────────────────────────────────────────────
function SupplierModal({ supplier, onClose, onSaved }) {
  const isEdit = !!supplier;
  const [form, setForm] = useState({
    name:   supplier?.name   || '',
    email:  supplier?.email  || '',
    phone:  supplier?.phone  || '',
    street: supplier?.street || '',
    city:   supplier?.city   || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Le nom est obligatoire.'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await odooCall('res.partner', 'write', [[supplier.id], {
          name: form.name, email: form.email,
          phone: form.phone, street: form.street, city: form.city,
        }]);
      } else {
        await odooCall('res.partner', 'create', [{
          ...form, supplier_rank: 1, is_company: true,
        }]);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',   label: 'Raison sociale *', placeholder: 'Ex: Tech Maroc SARL' },
    { key: 'email',  label: 'Email',             placeholder: 'contact@fournisseur.ma' },
    { key: 'phone',  label: 'Téléphone',         placeholder: '+212 6XX XXX XXX' },
    { key: 'street', label: 'Adresse',           placeholder: 'Rue, N°' },
    { key: 'city',   label: 'Ville',             placeholder: 'Oujda' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-[#10174f]">
            {isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-[13px]">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-[#ececf5] rounded-xl px-3 py-2.5 text-[14px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 border border-[#ececf5] rounded-xl py-2.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-[#4f46ff] text-white rounded-xl py-2.5 text-[14px] font-semibold hover:bg-[#3d35e0] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function DeleteModal({ supplier, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await odooCall('res.partner', 'write', [[supplier.id], { supplier_rank: 0 }]);
      onDeleted();
      onClose();
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h2 className="text-[16px] font-bold text-[#10174f] mb-2">Supprimer ce fournisseur ?</h2>
        <p className="text-[13px] text-slate-400 mb-6">
          <span className="font-semibold text-[#10174f]">{supplier.name}</span> sera retiré de la liste des fournisseurs.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-[#ececf5] rounded-xl py-2.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50">
            Annuler
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-[14px] font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(null); // null | { type: 'create'|'edit'|'delete', supplier? }

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await odooCall('res.partner', 'search_read',
        [[['supplier_rank', '>', 0]]],
        { fields: ['id', 'name', 'email', 'phone', 'city', 'street'], order: 'name asc', limit: 200 }
      );
      setSuppliers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#10174f]">Fournisseurs</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {suppliers.length} fournisseur{suppliers.length !== 1 ? 's' : ''} enregistré{suppliers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4f46ff] text-white rounded-xl text-[13px] font-semibold hover:bg-[#3d35e0] transition-all shadow-sm"
        >
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, ville, email…"
          className="w-full pl-9 pr-4 py-2.5 border border-[#ececf5] rounded-xl text-[14px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30"
        />
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Users size={44} className="mx-auto mb-3 opacity-30" />
          <p className="text-[14px]">Aucun fournisseur trouvé</p>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="mt-4 px-4 py-2 bg-[#4f46ff] text-white rounded-xl text-[13px] font-semibold hover:bg-[#3d35e0]"
          >
            Créer le premier fournisseur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id}
              className="bg-white border border-[#ececf5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

              {/* Avatar + Nom */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#f1efff] flex items-center justify-center shrink-0">
                    <span className="text-[#4f46ff] font-bold text-[15px]">
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#10174f] leading-snug">{s.name}</p>
                    {s.city && (
                      <p className="text-[12px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {s.city}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setModal({ type: 'edit', supplier: s })}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#f1efff] hover:text-[#4f46ff] transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setModal({ type: 'delete', supplier: s })}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Infos contact */}
              <div className="space-y-1.5">
                {s.email ? (
                  <a href={`mailto:${s.email}`}
                    className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-[#4f46ff] transition-colors truncate">
                    <Mail size={13} className="shrink-0" /> {s.email}
                  </a>
                ) : (
                  <p className="flex items-center gap-2 text-[12px] text-slate-300 italic">
                    <Mail size={13} /> Pas d'email
                  </p>
                )}
                {s.phone ? (
                  <a href={`tel:${s.phone}`}
                    className="flex items-center gap-2 text-[12px] text-slate-500 hover:text-[#4f46ff] transition-colors">
                    <Phone size={13} className="shrink-0" /> {s.phone}
                  </a>
                ) : (
                  <p className="flex items-center gap-2 text-[12px] text-slate-300 italic">
                    <Phone size={13} /> Pas de téléphone
                  </p>
                )}
                {s.street && (
                  <p className="flex items-center gap-2 text-[12px] text-slate-500 truncate">
                    <MapPin size={13} className="shrink-0" /> {s.street}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'create' && (
        <SupplierModal onClose={() => setModal(null)} onSaved={fetchSuppliers} />
      )}
      {modal?.type === 'edit' && (
        <SupplierModal supplier={modal.supplier} onClose={() => setModal(null)} onSaved={fetchSuppliers} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal supplier={modal.supplier} onClose={() => setModal(null)} onDeleted={fetchSuppliers} />
      )}
    </div>
  );
}