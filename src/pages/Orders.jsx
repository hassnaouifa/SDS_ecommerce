import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatters";

// Composants UI
import StatusBadge from "../components/ui/StatusBadge";
import SummaryCard from "../components/ui/SummaryCard";

// Composants Orders
import OrderStatusBar from "../components/orders/OrderStatusBar";
import ViewOrderModal from "../components/orders/modals/ViewOrderModal";
import AddLineModal from "../components/orders/modals/AddLineModal";
import AddFeeModal from "../components/orders/modals/AddFeeModal";
import PaymentModal from "../components/orders/modals/PaymentModal";
import DeliveryModal from "../components/orders/modals/DeliveryModal";

// Icônes (J'ai ajouté "Truck" pour le joli camion bleu !)
import { 
  ShoppingBag, Calendar, User, Wallet, CheckCircle2, Clock3, 
  FileText, Eye, RefreshCcw, X, AlertCircle, Truck
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showAddLineModal, setShowAddLineModal] = useState(false);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [productsResult, setProductsResult] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [lineQty, setLineQty] = useState(1);
  const [linePrice, setLinePrice] = useState("");

  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("idle");
  const [checkoutData, setCheckoutData] = useState(null);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState("idle");

  const loadOrderDetails = async (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      return;
    }
    try {
      setMessage("");
      const response = await api.post("/api/order/details", {
        params: { order_id: Number(orderId) },
      });
      const result = response.data.result || response.data;
      if (result.success && result.data) {
        setSelectedOrder(result.data);
      } else {
        setMessage(result.message || "Impossible de charger les détails.");
      }
    } catch (err) {
      setMessage("Erreur lors du chargement des détails.");
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const response = await api.post("/api/orders", { params: { limit: 20 } });
      const result = response.data.result || response.data;
      if (result.success) {
        const data = result.data || [];
        setOrders(data);
        if (data.length > 0) {
          let orderToSelect = selectedOrderId ? data.find((o) => Number(o.id) === Number(selectedOrderId)) : null;
          if (!orderToSelect) orderToSelect = data[0];
          setSelectedOrderId(orderToSelect.id);
          setSelectedOrder(orderToSelect);
          await loadOrderDetails(orderToSelect.id);
        } else {
          setSelectedOrderId(null);
          setSelectedOrder(null);
        }
      } else {
        setError(result.message || "Impossible de charger les commandes.");
      }
    } catch (err) {
      setError("Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    try {
      setMessage("");
      const response = await api.post("/api/products/search", { params: { search: productSearch, limit: 20 } });
      const result = response.data.result || response.data;
      if (result.success) setProductsResult(result.data || []);
      else setMessage(result.message || "Impossible de rechercher les produits.");
    } catch (err) { setMessage("Erreur de recherche."); }
  };

  const handleAddLine = async () => {
    if (!displayedOrder?.id || !selectedProductId) return;
    try {
      setActionLoading(true);
      const response = await api.post("/api/order/add-line", { params: { order_id: displayedOrder.id, product_id: Number(selectedProductId), quantity: Number(lineQty || 1), price_unit: linePrice === "" ? null : Number(linePrice) } });
      const result = response.data.result || response.data;
      if (result.success) {
        setMessage("Article ajouté."); setShowAddLineModal(false); setSelectedProductId(""); setLineQty(1); setLinePrice(""); setProductSearch(""); await loadOrders();
      } else setMessage(result.message);
    } catch (err) { setMessage("Erreur ajout."); } finally { setActionLoading(false); }
  };

  const handleAddFee = async () => {
    if (!displayedOrder?.id) return;
    try {
      setActionLoading(true);
      const response = await api.post("/api/order/add-fee", { params: { order_id: displayedOrder.id, fee_name: feeName, amount: Number(feeAmount || 0) } });
      const result = response.data.result || response.data;
      if (result.success) {
        setMessage("Frais ajouté."); setShowAddFeeModal(false); setFeeName(""); setFeeAmount(""); await loadOrders();
      } else setMessage(result.message);
    } catch (err) { setMessage("Erreur frais."); } finally { setActionLoading(false); }
  };

  const handleConfirmOrder = async (goNext = false) => {
    if (!displayedOrder?.id) return;
    try {
      setActionLoading(true);
      const response = await api.post("/api/order/confirm", { params: { order_id: displayedOrder.id } });
      const result = response.data.result || response.data;
      if (result.success) {
        setMessage("Commande validée avec succès."); await loadOrders();
      } else setMessage(result.message);
    } catch (err) { setMessage("Erreur validation."); } finally { setActionLoading(false); }
  };

  const handleDeleteOrder = async () => {
    if (!displayedOrder?.id) return;
    if (!window.confirm("Voulez-vous vraiment supprimer cette commande ?")) return;
    try {
      setActionLoading(true);
      const response = await api.post("/api/order/delete", { params: { order_id: displayedOrder.id } });
      const result = response.data.result || response.data;
      if (result.success) {
        setMessage("Commande supprimée."); setSelectedOrderId(null); setSelectedOrder(null); await loadOrders();
      } else setMessage(result.message);
    } catch (err) { setMessage("Erreur suppression."); } finally { setActionLoading(false); }
  };

const handleCheckout = async () => {
    if (!displayedOrder?.id) return;
    setPaymentStep("processing"); // On lance l'animation de chargement
    try {
      const response = await api.post("/api/order/checkout", { params: { order_id: displayedOrder.id, payment_method: "carte" } });
      const result = response.data.result || response.data;
      if (result.success) {
        setCheckoutData(result.data); setPaymentStep("success"); await loadOrders();
        if (result.data.has_ice && result.data.invoice_created) {
          const link = document.createElement("a"); link.href = `http://localhost:8069${result.data.invoice_url}`; link.target = "_blank"; link.setAttribute("download", `Facture_${displayedOrder.name}.pdf`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }
      } else { setShowPaymentModal(false); setMessage(result.message); }
    } catch (err) { setShowPaymentModal(false); setMessage("Erreur paiement."); }
  };

  const handleValidateDelivery = async () => {
    if (!displayedOrder?.id) return;
    setDeliveryStep("processing");
    try {
      const response = await api.post("/api/order/delivery/validate", { params: { order_id: displayedOrder.id } });
      const result = response.data.result || response.data;
      if (result.success) { setDeliveryStep("success"); await loadOrders(); }
      else { setShowDeliveryModal(false); setMessage(result.message); }
    } catch (err) { setShowDeliveryModal(false); setMessage("Erreur livraison."); }
  };

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { if (selectedOrderId) loadOrderDetails(selectedOrderId); else setSelectedOrder(null); }, [selectedOrderId]);
  useEffect(() => { if (showAddLineModal) searchProducts(); }, [showAddLineModal]);

  const displayedOrder = selectedOrder || orders.find((o) => Number(o.id) === Number(selectedOrderId)) || null;

  const subtotal = useMemo(() => {
    if (!displayedOrder?.lines) return 0;
    return displayedOrder.lines.reduce((sum, line) => sum + (line.amount || 0), 0);
  }, [displayedOrder]);

  const orderCount = orders.length;
  const confirmedCount = orders.filter((o) => ["sale", "done"].includes(o.state)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount_total || 0), 0);

  if (loading) return <div className="bg-white rounded-[24px] border border-[#ececf5] p-6"><p className="text-slate-500">Chargement des commandes...</p></div>;
  if (error) return <div className="bg-red-50 rounded-[24px] border border-red-200 p-6 text-red-600">{error}</div>;

  const isEditable = displayedOrder && ["draft", "sent"].includes(displayedOrder.state);

  // --- LOGIQUE POUR LA BANNIERE DE NOTIFICATION ---
  const isAlreadyDelivered = message.includes('déjà bien livrée') || message.includes('Aucun bon de livraison');
  const isError = !isAlreadyDelivered && (message.toLowerCase().includes('erreur') || message.toLowerCase().includes('seules') || message.toLowerCase().includes('introuvable') || message.toLowerCase().includes('impossible'));
  const isSuccess = !isAlreadyDelivered && (message.toLowerCase().includes('succès') || message.toLowerCase().includes('ajouté') || message.toLowerCase().includes('supprimée'));

  // On remplace le texte si c'est l'ancien message d'Odoo
  const displayMessage = message.includes('Aucun bon de livraison') 
    ? "Cette commande est déjà bien livrée ! Contactez le client en cas de conflit ou de réclamation." 
    : message;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46ff] text-white flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="text-[32px] font-bold text-[#10174f]">Commandes</h1>
            <p className="text-slate-400 text-sm mt-1">Gestion et aperçu détaillé des commandes</p>
          </div>
        </div>
        <button onClick={loadOrders} className="h-12 px-5 rounded-full bg-white border border-[#e9eaf4] text-[#10174f] flex items-center gap-2">
          <RefreshCcw size={16} /><span>Actualiser</span>
        </button>
      </div>

      {message && (
        <div 
          className={`rounded-[18px] border px-4 py-3 text-sm flex items-center gap-3 shadow-sm transition-all ${
            isAlreadyDelivered ? 'bg-blue-50 border-blue-200 text-blue-700' :
            isError ? 'bg-amber-50 border-amber-200 text-amber-700' :
            isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            'bg-white border-[#ececf5] text-[#10174f]'
          }`}
        >
          {isAlreadyDelivered ? (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Truck size={16} className="text-blue-600" />
            </div>
          ) : isError ? (
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
          ) : isSuccess ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          ) : null}

          <span className="flex-1 font-medium">{displayMessage}</span>
          
          <button onClick={() => setMessage("")} className="opacity-50 hover:opacity-100 transition-opacity p-1">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={FileText} title="Total des commandes" value={orderCount} />
        <SummaryCard icon={CheckCircle2} title="Commandes confirmées" value={confirmedCount} colorClass="text-emerald-600" />
        <SummaryCard icon={Wallet} title="Chiffre d’affaires" value={formatCurrency(totalRevenue)} colorClass="text-[#4f46ff]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3 bg-white rounded-[24px] border border-[#ececf5] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#10174f]">Liste des commandes</h2>
            <span className="text-sm text-slate-400">{orders.length} éléments</span>
          </div>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {orders.length > 0 ? (
              orders.map((order) => {
                const active = Number(selectedOrderId) === Number(order.id);
                return (
                  <button key={order.id} onClick={() => { setMessage(""); setSelectedOrderId(order.id); setSelectedOrder(order); }} className={`w-full text-left rounded-[20px] p-4 border transition ${active ? "bg-[#f5f3ff] border-[#cfc8ff]" : "bg-[#fafafe] border-[#ececf5] hover:bg-white"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#10174f]">{order.name}</p>
                        <p className="text-sm text-slate-400 mt-1">{order.customer}</p>
                      </div>
                      <StatusBadge status={order.state} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-400">{order.date_order}</span>
                      <span className="font-semibold text-[#10174f]">{formatCurrency(order.amount_total)}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-slate-400 text-sm">Aucune commande trouvée.</div>
            )}
          </div>
        </div>

        <div className="xl:col-span-9 space-y-4">
          {!selectedOrderId && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-[18px] px-4 py-3 text-sm">
              Aucune commande n’est sélectionnée.
            </div>
          )}

          {displayedOrder ? (
            <>
<OrderStatusBar 
  order={displayedOrder} 
  isPaymentDone={checkoutData?.order_id === displayedOrder?.id} /* NOUVELLE LIGNE POUR BLOQUER LE BOUTON DIRECTEMENT */
  onValidate={() => handleConfirmOrder(false)} 
  onPay={() => { setShowPaymentModal(true); setPaymentStep("idle"); }} 
  onDeliver={() => { setShowDeliveryModal(true); setDeliveryStep("idle"); }} 
  onDelete={handleDeleteOrder} 
/>
              <div className="bg-white rounded-[24px] border border-[#ececf5] p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#10174f]">Détails de la commande</h2>
                    <p className="text-slate-400 mt-1">Détails complets de la commande sélectionnée</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={displayedOrder.state} />
                    <button onClick={() => setShowViewModal(true)} className="h-11 px-4 rounded-full bg-[#f5f3ff] text-[#4f46ff] font-medium flex items-center gap-2">
                      <Eye size={16} />
                      <span>Voir</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                  <div className="rounded-[20px] bg-[#fafafe] border border-[#ececf5] p-4">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#4f46ff]" />
                      <p className="text-sm text-slate-400">Client</p>
                    </div>
                    <p className="font-semibold text-[#10174f] mt-3">{displayedOrder.customer}</p>
                  </div>
                  <div className="rounded-[20px] bg-[#fafafe] border border-[#ececf5] p-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-[#4f46ff]" />
                      <p className="text-sm text-slate-400">Date de commande</p>
                    </div>
                    <p className="font-semibold text-[#10174f] mt-3">{displayedOrder.date_order}</p>
                  </div>
                  <div className="rounded-[20px] bg-[#fafafe] border border-[#ececf5] p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#4f46ff]" />
                      <p className="text-sm text-slate-400">Référence</p>
                    </div>
                    <p className="font-semibold text-[#10174f] mt-3">{displayedOrder.name}</p>
                  </div>
                  <div className="rounded-[20px] bg-[#fafafe] border border-[#ececf5] p-4">
                    <div className="flex items-center gap-3">
                      <Clock3 size={18} className="text-[#4f46ff]" />
                      <p className="text-sm text-slate-400">Montant</p>
                    </div>
                    <p className="font-semibold text-[#10174f] mt-3">{formatCurrency(displayedOrder.amount_total)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 mt-4">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[#10174f]">Lignes de commande</h3>
                  <button className="px-4 py-2 rounded-full border border-[#ececf5] text-slate-400 text-sm">
                    {displayedOrder.lines?.length || 0} éléments
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="text-left text-slate-400 text-sm border-b border-[#ececf5]">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Produit</th>
                        <th className="pb-3 font-medium">Quantité</th>
                        <th className="pb-3 font-medium">Prix unitaire</th>
                        <th className="pb-3 font-medium">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedOrder.lines && displayedOrder.lines.length > 0 ? (
                        displayedOrder.lines.map((line, index) => (
                          <tr key={line.id} className="border-b border-[#f3f4f8] text-[#10174f]">
                            <td className="py-4">{String(index + 1).padStart(2, "0")}</td>
                            <td className="py-4 font-medium">{line.product_name}</td>
                            <td className="py-4">{line.quantity}</td>
                            <td className="py-4">{formatCurrency(line.unit_price)}</td>
                            <td className="py-4">{formatCurrency(line.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-400">Aucune ligne de commande.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                  <div className="flex flex-wrap gap-3">
                    {isEditable ? (
                      <>
                        <button onClick={() => setShowAddLineModal(true)} className="h-11 px-5 rounded-full border border-[#ececf5] bg-white text-[#10174f] hover:bg-[#fafafe]">Ajouter un article</button>
                        <button onClick={() => setShowAddFeeModal(true)} className="h-11 px-5 rounded-full border border-[#ececf5] bg-white text-slate-400 hover:bg-[#fafafe]">Ajouter frais</button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-sm border border-amber-100">
                        <span>Cette commande est déjà validée, elle ne peut plus être modifiée.</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-[250px] rounded-[20px] bg-[#fafafe] border border-[#ececf5] p-5">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-slate-400">Sous-total</span>
                      <span className="font-semibold text-[#10174f]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base pt-3 border-t border-[#ececf5]">
                      <span className="font-semibold text-[#10174f]">Total</span>
                      <span className="font-bold text-[#10174f]">{formatCurrency(displayedOrder.amount_total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[24px] border border-[#ececf5] p-8 text-slate-400 text-center">
              Sélectionnez une commande pour voir les détails.
            </div>
          )}
        </div>
      </div>

      <ViewOrderModal open={showViewModal} onClose={() => setShowViewModal(false)} order={displayedOrder} />
      <AddLineModal open={showAddLineModal} onClose={() => setShowAddLineModal(false)} productSearch={productSearch} setProductSearch={setProductSearch} onSearch={searchProducts} productsResult={productsResult} selectedProductId={selectedProductId} setSelectedProductId={setSelectedProductId} lineQty={lineQty} setLineQty={setLineQty} linePrice={linePrice} setLinePrice={setLinePrice} onAdd={handleAddLine} actionLoading={actionLoading} />
      <AddFeeModal open={showAddFeeModal} onClose={() => setShowAddFeeModal(false)} feeName={feeName} setFeeName={setFeeName} feeAmount={feeAmount} setFeeAmount={setFeeAmount} onAdd={handleAddFee} actionLoading={actionLoading} />
<PaymentModal 
  open={showPaymentModal} 
  onClose={() => setShowPaymentModal(false)} 
  paymentStep={paymentStep} 
  checkoutData={checkoutData} 
  order={displayedOrder} 
  onGoToDelivery={() => { setShowPaymentModal(false); setShowDeliveryModal(true); setDeliveryStep("idle"); }} 
  onConfirmPayment={handleCheckout} // <--- C'est ici qu'on branche le nouveau bouton !
/>      <DeliveryModal open={showDeliveryModal} onClose={() => setShowDeliveryModal(deliveryStep === "processing")} deliveryStep={deliveryStep} order={displayedOrder} onValidateDelivery={handleValidateDelivery} />
    </div>
  );
}