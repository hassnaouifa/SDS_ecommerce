import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, CheckCircle, Search, X, Loader2,
  FileText, FileDown, Users, ClipboardList, AlertCircle
} from 'lucide-react';
import api from '../api/axios';


const ODOO_BASE_URL = import.meta.env.VITE_ODOO_BASE_URL || '';

async function odooCall(model, method, args = [], kwargs = {}) {
  const res = await api.post('/web/dataset/call_kw', {
    jsonrpc: '2.0', method: 'call', id: 1,
    params: { model, method, args, kwargs }
  });
  if (res.data.error) throw new Error(res.data.error.data?.message || res.data.error.message);
  return res.data.result;
}

const STATUS = {
  draft:    { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
  sent:     { label: 'Envoyé',    color: 'bg-blue-100 text-blue-700' },
  purchase: { label: 'Confirmé',  color: 'bg-green-100 text-green-700' },
  cancel:   { label: 'Annulé',    color: 'bg-red-100 text-red-600' },
};

function StatusBadge({ state }) {
  const s = STATUS[state] || STATUS.draft;
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

// ─── Modal création fournisseur ───────────────────────────────────────────────
function SupplierModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', street: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Le nom est obligatoire.'); return; }
    setLoading(true); setError('');
    try {
      const id = await odooCall('res.partner', 'create', [{
        name: form.name, email: form.email, phone: form.phone,
        street: form.street, city: form.city,
        supplier_rank: 1, is_company: true,
      }]);
      onCreated({ id, name: form.name });
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-[#10174f]">Nouveau fournisseur</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-[13px]">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="space-y-3">
          {[
            { key: 'name',   label: 'Raison sociale *', placeholder: 'Ex: Tech Maroc SARL' },
            { key: 'email',  label: 'Email',             placeholder: 'contact@fournisseur.ma' },
            { key: 'phone',  label: 'Téléphone',         placeholder: '+212 6XX XXX XXX' },
            { key: 'street', label: 'Adresse',           placeholder: 'Rue, N°' },
            { key: 'city',   label: 'Ville',             placeholder: 'Oujda' },
          ].map(f => (
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PurchaseOrders() {
  const [tab, setTab] = useState('list');

  const [orders, setOrders]       = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  const [form, setForm] = useState({
    partner_id: '',
    date_order: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [lines, setLines] = useState([
    { product_name: '', qty: 1, price_unit: 0, description: '' }
  ]);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pos, sups] = await Promise.all([
        odooCall('purchase.order', 'search_read', [[]], {
          fields: ['id', 'name', 'partner_id', 'state', 'amount_total', 'date_order'],
          order: 'id desc', limit: 100
        }),
        odooCall('res.partner', 'search_read', [[['supplier_rank', '>', 0]]], {
          fields: ['id', 'name', 'email', 'phone'], limit: 200
        }),
      ]);
      setOrders(pos);
      setSuppliers(sups);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Lignes ──
  const addLine = () =>
    setLines(l => [...l, { product_name: '', qty: 1, price_unit: 0, description: '' }]);

  const removeLine = i =>
    setLines(l => l.filter((_, idx) => idx !== i));

  const updateLine = (i, key, val) =>
    setLines(l => l.map((row, idx) => idx !== i ? row : { ...row, [key]: val }));

  const totalAmount = lines.reduce(
    (s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price_unit) || 0), 0
  );

  // ── Créer BC ──
  const handleCreatePO = async () => {
    if (!form.partner_id) { setFormError('Sélectionnez un fournisseur.'); return; }
    if (lines.some(l => !l.product_name.trim())) {
      setFormError('Chaque ligne doit avoir un nom de produit.');
      return;
    }
    setSaving(true); setFormError(''); setFormSuccess('');
    try {
      const res = await api.post('/api/purchase/create', {
        params: {
          partner_id: parseInt(form.partner_id),
          lines: lines.map(l => ({
            product_name: l.product_name,
            description:  l.description,
            qty:          parseFloat(l.qty),
            price_unit:   parseFloat(l.price_unit),
          })),
        }
      });

      if (!res.data.result?.success) {
        throw new Error(res.data.result?.error || 'Erreur création');
      }

      setFormSuccess('Bon de commande créé avec succès !');
      setForm({ partner_id: '', date_order: new Date().toISOString().slice(0, 10), notes: '' });
      setLines([{ product_name: '', qty: 1, price_unit: 0, description: '' }]);
      await fetchAll();
      setTimeout(() => { setTab('list'); setFormSuccess(''); }, 1500);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Confirmer BC ──
  const handleConfirm = async (id) => {
    setActionLoading(p => ({ ...p, [`confirm_${id}`]: true }));
    try {
      await odooCall('purchase.order', 'button_confirm', [[id]]);
      await fetchAll();
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setActionLoading(p => ({ ...p, [`confirm_${id}`]: false }));
    }
  };

  // ── Téléchargements — ID Odoo réel passé directement ──
  const handleDownloadPDF = (id, name) => {
    const url = `${ODOO_BASE_URL}/api/purchase/download-pdf/${id}?t=${Date.now()}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `BC_${name}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWord = (id, name) => {
    const url = `${ODOO_BASE_URL}/api/purchase/download-word/${id}?t=${Date.now()}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `BC_${name}.docx`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = orders.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.partner_id?.[1] || '').toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#10174f]">Bons de commande</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Gérez vos achats fournisseurs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#ececf5] rounded-xl text-[13px] font-semibold text-[#10174f] hover:bg-slate-50 transition-all"
          >
            <Users size={16} /> Nouveau fournisseur
          </button>
          <button
            onClick={() => { setTab('new'); setFormError(''); setFormSuccess(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4f46ff] text-white rounded-xl text-[13px] font-semibold hover:bg-[#3d35e0] transition-all shadow-sm"
          >
            <Plus size={16} /> Nouveau BC
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'list', label: 'Liste des BC', icon: ClipboardList },
          { key: 'new',  label: 'Créer un BC',  icon: Plus },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              tab === t.key
                ? 'bg-white text-[#4f46ff] shadow-sm'
                : 'text-slate-500 hover:text-[#10174f]'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB : LISTE ══════════ */}
      {tab === 'list' && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par numéro ou fournisseur…"
              className="w-full pl-9 pr-4 py-2.5 border border-[#ececf5] rounded-xl text-[14px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 size={24} className="animate-spin mr-2" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-[14px]">Aucun bon de commande trouvé</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ececf5] overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ececf5] bg-slate-50">
                    {['Référence', 'Fournisseur', 'Date', 'Montant total', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => (
                    <tr key={o.id}
                      className={`border-b border-[#ececf5] hover:bg-slate-50/60 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}>

                      {/* Référence + ID Odoo réel pour debug */}
                      <td className="px-4 py-3 text-[13px] font-bold text-[#4f46ff]">
                        {o.name}
                        <span className="ml-1 text-slate-300 text-[10px] font-normal">#{o.id}</span>
                      </td>

                      <td className="px-4 py-3 text-[13px] text-[#10174f]">{o.partner_id?.[1] || '—'}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-500">
                        {o.date_order ? new Date(o.date_order).toLocaleDateString('fr-MA') : '—'}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-[#10174f]">
                        {parseFloat(o.amount_total).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                      </td>
                      <td className="px-4 py-3"><StatusBadge state={o.state} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {o.state === 'draft' && (
                            <button
                              onClick={() => handleConfirm(o.id)}
                              disabled={actionLoading[`confirm_${o.id}`]}
                              title="Confirmer"
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading[`confirm_${o.id}`]
                                ? <Loader2 size={14} className="animate-spin" />
                                : <CheckCircle size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(o.id, o.name)}
                            title="Télécharger PDF"
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadWord(o.id, o.name)}
                            title="Télécharger Word (.docx)"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          >
                            <FileDown size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB : NOUVEAU BC ══════════ */}
      {tab === 'new' && (
        <div className="bg-white rounded-2xl border border-[#ececf5] shadow-sm p-6">
          <h2 className="text-[16px] font-bold text-[#10174f] mb-5">Nouveau bon de commande</h2>

          {formError && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-[13px]">
              <AlertCircle size={15} /> {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 text-[13px]">
              <CheckCircle size={15} /> {formSuccess}
            </div>
          )}

          {/* Fournisseur + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Fournisseur *</label>
              <div className="flex gap-2">
                <select
                  value={form.partner_id}
                  onChange={e => setForm(p => ({ ...p, partner_id: e.target.value }))}
                  className="flex-1 border border-[#ececf5] rounded-xl px-3 py-2.5 text-[14px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30 bg-white"
                >
                  <option value="">— Sélectionner —</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowSupplierModal(true)}
                  className="px-3 py-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Créer un nouveau fournisseur"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Date de commande</label>
              <input
                type="date"
                value={form.date_order}
                onChange={e => setForm(p => ({ ...p, date_order: e.target.value }))}
                className="w-full border border-[#ececf5] rounded-xl px-3 py-2.5 text-[14px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30"
              />
            </div>
          </div>

          {/* Lignes de commande */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[13px] font-bold text-[#10174f]">Lignes de commande</label>
              <button
                onClick={addLine}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1efff] text-[#4f46ff] rounded-lg text-[12px] font-semibold hover:bg-[#e8e5ff] transition-colors"
              >
                <Plus size={13} /> Ajouter ligne
              </button>
            </div>

            <div className="rounded-xl border border-[#ececf5] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#ececf5]">
                    {['Désignation produit *', 'Description', 'Qté', 'Prix unitaire (MAD)', ''].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-b border-[#ececf5] last:border-0">
                      <td className="px-3 py-2">
                        <input
                          value={line.product_name}
                          onChange={e => updateLine(i, 'product_name', e.target.value)}
                          placeholder="Ex: Câble USB-C 2m"
                          className="w-full border border-[#ececf5] rounded-lg px-2 py-2 text-[13px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30 min-w-[180px]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={line.description}
                          onChange={e => updateLine(i, 'description', e.target.value)}
                          placeholder="Description optionnelle"
                          className="w-full border border-[#ececf5] rounded-lg px-2 py-2 text-[13px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30 min-w-[120px]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="1"
                          value={line.qty}
                          onChange={e => updateLine(i, 'qty', e.target.value)}
                          className="border border-[#ececf5] rounded-lg px-2 py-2 text-[13px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30 w-[70px]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="0" step="0.01"
                          value={line.price_unit}
                          onChange={e => updateLine(i, 'price_unit', e.target.value)}
                          className="border border-[#ececf5] rounded-lg px-2 py-2 text-[13px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30 w-[110px]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {lines.length > 1 && (
                          <button
                            onClick={() => removeLine(i)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-3">
              <div className="bg-slate-50 rounded-xl px-5 py-3 text-right">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total estimé</p>
                <p className="text-[20px] font-bold text-[#10174f] mt-0.5">
                  {totalAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-[14px] text-slate-400">MAD</span>
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Notes internes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Conditions particulières, délais, remarques…"
              className="w-full border border-[#ececf5] rounded-xl px-3 py-2.5 text-[14px] text-[#10174f] focus:outline-none focus:ring-2 focus:ring-[#4f46ff]/30 resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={() => setTab('list')}
              className="flex-1 border border-[#ececf5] rounded-xl py-3 text-[14px] font-medium text-slate-500 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={handleCreatePO}
              disabled={saving}
              className="flex-1 bg-[#4f46ff] text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-[#3d35e0] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
              Créer le bon de commande
            </button>
          </div>
        </div>
      )}

      {/* Modal fournisseur */}
      {showSupplierModal && (
        <SupplierModal
          onClose={() => setShowSupplierModal(false)}
          onCreated={async (newSup) => {
            await fetchAll();
            setForm(p => ({ ...p, partner_id: String(newSup.id) }));
          }}
        />
      )}
    </div>
  );
}