import { useState, useRef, useEffect } from "react";
import { X, Search, Plus, Trash2, FileDown, FileText, Loader2, Check, User, Package } from "lucide-react";
import api from "../../api/axios";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

const TVA_RATE = 0.20;

export default function QuoteModal({ isOpen, onClose }) {
  // --- Étapes : "form" (édition) -> "done" (devis créé, lien de téléchargement) ---
  const [step, setStep] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- Client ---
  const [clientMode, setClientMode] = useState("search"); // "search" | "free"
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [freeClient, setFreeClient] = useState({ name: "", phone: "", email: "" });

  // --- Lignes du devis ---
  const [lines, setLines] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // --- Notes ---
  const [notes, setNotes] = useState("");
  const [validityDays, setValidityDays] = useState(15);

  // --- Résultat après création ---
  const [createdQuote, setCreatedQuote] = useState(null); // { id, name, pdf_url }

  const clientSearchTimeout = useRef(null);
  const productSearchTimeout = useRef(null);

  // Reset complet à la fermeture
  const handleClose = () => {
    setStep("form");
    setClientMode("search");
    setClientQuery("");
    setClientResults([]);
    setSelectedClient(null);
    setFreeClient({ name: "", phone: "", email: "" });
    setLines([]);
    setProductQuery("");
    setProductResults([]);
    setNotes("");
    setValidityDays(15);
    setCreatedQuote(null);
    setErrorMsg("");
    onClose();
  };

  // --- Recherche client (debounced) ---
  useEffect(() => {
    if (clientSearchTimeout.current) clearTimeout(clientSearchTimeout.current);
    if (clientQuery.trim().length < 2) {
      setClientResults([]);
      return;
    }
    clientSearchTimeout.current = setTimeout(async () => {
      setIsSearchingClient(true);
      try {
        const res = await api.post("/api/quotes/search_partners", { 
  params: { query: clientQuery } 
});
        if (res.data.result?.success) {
          setClientResults(res.data.result.data || []);
        }
      } catch (e) {
        console.error("Erreur recherche client :", e);
      } finally {
        setIsSearchingClient(false);
      }
    }, 350);
    return () => clearTimeout(clientSearchTimeout.current);
  }, [clientQuery]);

  // --- Recherche produit (debounced) ---
  useEffect(() => {
    if (productSearchTimeout.current) clearTimeout(productSearchTimeout.current);
    if (productQuery.trim().length < 2) {
      setProductResults([]);
      return;
    }
    productSearchTimeout.current = setTimeout(async () => {
      setIsSearchingProduct(true);
      try {
        const res = await api.post("/api/quotes/search_products", { 
  params: { query: productQuery } 
});
        if (res.data.result?.success) {
          setProductResults(res.data.result.data || []);
          setShowProductDropdown(true);
        }
      } catch (e) {
        console.error("Erreur recherche produit :", e);
      } finally {
        setIsSearchingProduct(false);
      }
    }, 350);
    return () => clearTimeout(productSearchTimeout.current);
  }, [productQuery]);

  const addProductLine = (product) => {
    setLines((prev) => [
      ...prev,
      {
        id: `p_${product.id}_${Date.now()}`,
        product_id: product.id,
        description: product.name,
        quantity: 1,
        unit_price: product.list_price || 0,
        is_free: false,
      },
    ]);
    setProductQuery("");
    setProductResults([]);
    setShowProductDropdown(false);
  };

  const addFreeLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `f_${Date.now()}`,
        product_id: null,
        description: "",
        quantity: 1,
        unit_price: 0,
        is_free: true,
      },
    ]);
  };

  const updateLine = (id, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const removeLine = (id) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  // --- Totaux ---
  const totalHT = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
    0
  );
  const totalTVA = totalHT * TVA_RATE;
  const totalTTC = totalHT + totalTVA;

  const canSubmit =
    (clientMode === "search" ? !!selectedClient : freeClient.name.trim() !== "") &&
    lines.length > 0 &&
    lines.every((l) => l.description.trim() !== "" && Number(l.quantity) > 0);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      client_mode: clientMode,
      partner_id: clientMode === "search" ? selectedClient?.id : null,
      free_client: clientMode === "free" ? freeClient : null,
      lines: lines.map((l) => ({
        product_id: l.product_id,
        description: l.description,
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
      })),
      notes,
      validity_days: Number(validityDays) || 15,
    };

    try {
      const res = await api.post("/api/quotes/create", { 
  params: payload 
});
      if (res.data.result?.success) {
        setCreatedQuote(res.data.result.data);
        setStep("done");
      } else {
        setErrorMsg(res.data.result?.error || "Erreur lors de la création du devis.");
      }
    } catch (e) {
      console.error("Erreur création devis :", e);
      setErrorMsg("Erreur serveur. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!createdQuote?.pdf_url) return;
    window.open(createdQuote.pdf_url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0fb]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#4f46ff]/10 flex items-center justify-center">
              <FileText size={18} className="text-[#4f46ff]" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">
              {step === "form" ? "Nouveau devis" : "Devis créé"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ====================== ÉTAPE FORMULAIRE ====================== */}
        {step === "form" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* --- Bloc Client --- */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={15} /> Client
                  </label>
                  <div className="flex bg-slate-100 rounded-full p-1 text-xs font-medium">
                    <button
                      onClick={() => setClientMode("search")}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        clientMode === "search" ? "bg-white shadow text-[#4f46ff]" : "text-slate-500"
                      }`}
                    >
                      Client existant
                    </button>
                    <button
                      onClick={() => setClientMode("free")}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        clientMode === "free" ? "bg-white shadow text-[#4f46ff]" : "text-slate-500"
                      }`}
                    >
                      Saisie libre
                    </button>
                  </div>
                </div>

                {clientMode === "search" ? (
                  <div className="relative">
                    {selectedClient ? (
                      <div className="flex items-center justify-between bg-[#f4f4ff] border border-[#dcd9ff] rounded-2xl px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{selectedClient.name}</p>
                          <p className="text-xs text-slate-500">
                            {selectedClient.email || selectedClient.phone || "—"}
                          </p>
                        </div>
                        <button
                          onClick={() => { setSelectedClient(null); setClientQuery(""); }}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 flex items-center gap-2">
                          <Search size={15} className="text-slate-400 shrink-0" />
                          <input
                            type="text"
                            placeholder="Rechercher un client (nom, email, tél)"
                            value={clientQuery}
                            onChange={(e) => setClientQuery(e.target.value)}
                            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                          />
                          {isSearchingClient && <Loader2 size={14} className="animate-spin text-slate-400" />}
                        </div>
                        {clientResults.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-[#e9eaf4] rounded-2xl shadow-lg max-h-52 overflow-y-auto">
                            {clientResults.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => { setSelectedClient(c); setClientResults([]); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <p className="text-sm font-medium text-slate-800">{c.name}</p>
                                <p className="text-xs text-slate-500">{c.email || c.phone || "—"}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nom du client *"
                      value={freeClient.name}
                      onChange={(e) => setFreeClient((p) => ({ ...p, name: e.target.value }))}
                      className="h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 text-sm outline-none focus:border-[#4f46ff] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Téléphone"
                      value={freeClient.phone}
                      onChange={(e) => setFreeClient((p) => ({ ...p, phone: e.target.value }))}
                      className="h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 text-sm outline-none focus:border-[#4f46ff] transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={freeClient.email}
                      onChange={(e) => setFreeClient((p) => ({ ...p, email: e.target.value }))}
                      className="h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 text-sm outline-none focus:border-[#4f46ff] transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* --- Bloc Lignes produits --- */}
              <div>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Package size={15} /> Articles du devis
                </label>

                {/* Recherche produit */}
                <div className="relative mb-3">
                  <div className="h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 flex items-center gap-2">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit du catalogue..."
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      onFocus={() => productResults.length > 0 && setShowProductDropdown(true)}
                      className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    />
                    {isSearchingProduct && <Loader2 size={14} className="animate-spin text-slate-400" />}
                  </div>
                  {showProductDropdown && productResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-[#e9eaf4] rounded-2xl shadow-lg max-h-52 overflow-y-auto">
                      {productResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addProductLine(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-slate-800">{p.name}</span>
                          <span className="text-xs text-slate-500 shrink-0 ml-2">{formatCurrency(p.list_price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={addFreeLine}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#4f46ff] hover:text-[#3d36e0] mb-3"
                >
                  <Plus size={15} /> Ajouter une ligne libre
                </button>

                {/* Liste des lignes */}
                {lines.length > 0 && (
                  <div className="border border-[#e9eaf4] rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_70px_90px_90px_32px] gap-2 px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500">
                      <span>Désignation</span>
                      <span className="text-center">Qté</span>
                      <span className="text-right">Prix U.</span>
                      <span className="text-right">Total</span>
                      <span></span>
                    </div>
                    {lines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[1fr_70px_90px_90px_32px] gap-2 px-4 py-2 items-center border-t border-slate-50"
                      >
                        <input
                          type="text"
                          placeholder="Désignation"
                          value={line.description}
                          disabled={!line.is_free}
                          onChange={(e) => updateLine(line.id, "description", e.target.value)}
                          className="text-sm bg-transparent outline-none disabled:text-slate-700 text-slate-700 truncate"
                        />
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                          className="text-sm text-center bg-slate-50 rounded-lg py-1 outline-none focus:bg-slate-100"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_price}
                          disabled={!line.is_free}
                          onChange={(e) => updateLine(line.id, "unit_price", e.target.value)}
                          className="text-sm text-right bg-slate-50 rounded-lg py-1 px-1 outline-none focus:bg-slate-100 disabled:bg-transparent"
                        />
                        <span className="text-sm text-right font-medium text-slate-700">
                          {formatCurrency((Number(line.quantity) || 0) * (Number(line.unit_price) || 0))}
                        </span>
                        <button
                          onClick={() => removeLine(line.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors flex justify-center"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {lines.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-4 border border-dashed border-[#e9eaf4] rounded-2xl">
                    Aucun article ajouté pour l'instant
                  </p>
                )}
              </div>

              {/* --- Totaux --- */}
              {lines.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Total HT</span>
                    <span>{formatCurrency(totalHT)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>TVA (20%)</span>
                    <span>{formatCurrency(totalTVA)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-800 pt-1.5 border-t border-slate-200">
                    <span>Total TTC</span>
                    <span className="text-[#4f46ff]">{formatCurrency(totalTTC)}</span>
                  </div>
                </div>
              )}

              {/* --- Validité + Notes --- */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Validité (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 text-sm outline-none focus:border-[#4f46ff] transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Notes / conditions (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Paiement à 50% à la commande..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-[#e9eaf4] rounded-2xl px-4 text-sm outline-none focus:border-[#4f46ff] transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{errorMsg}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#eef0fb]">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white bg-[#4f46ff] hover:bg-[#3d36e0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                Créer le devis
              </button>
            </div>
          </>
        )}

        {/* ====================== ÉTAPE SUCCÈS ====================== */}
        {step === "done" && createdQuote && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Devis {createdQuote.name} créé avec succès
            </h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">
              Le devis a été enregistré dans Odoo. Vous pouvez le télécharger
              ci-dessous au format PDF.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white bg-[#4f46ff] hover:bg-[#3d36e0] transition-colors"
              >
                <FileDown size={16} /> Télécharger le devis (PDF)
              </button>
            </div>
            <button
              onClick={handleClose}
              className="mt-8 text-sm font-medium text-slate-400 hover:text-slate-600"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}