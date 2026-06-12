import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home, ShoppingBag, Package, Users, Boxes, BarChart3,
  MessageCircle, Receipt, Settings, LogOut, ShieldCheck,
  BookOpen, Network, ChevronDown, ShoppingCart, X, Menu,
  Truck, ClipboardList
} from "lucide-react";
import api from "../api/axios";

function MenuItem({ to, label, icon: Icon, badge, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-all duration-200 ${
          isActive
            ? "bg-[#f1efff] text-[#4f46ff] font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#10174f] font-medium"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[14px]">{label}</span>
          </div>
          {badge > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#4f46ff] text-white text-[10px] font-bold shadow-sm">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function DropdownMenu({ label, icon: Icon, subItems, onSubItemClick }) {
  const location = useLocation();
  const isActiveChild = subItems.some(item => location.pathname.startsWith(item.to));
  const [isOpen, setIsOpen] = useState(isActiveChild);

  useEffect(() => {
    if (isActiveChild) setIsOpen(true);
  }, [isActiveChild, location.pathname]);

  return (
    <div className="flex flex-col space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-all duration-200 w-full ${
          isActiveChild || isOpen
            ? "bg-slate-50 text-[#10174f] font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#10174f] font-medium"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} strokeWidth={isActiveChild || isOpen ? 2.5 : 2} />
          <span className="text-[14px]">{label}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out pl-7 ${
          isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
        }`}
      >
        {subItems.map((item, index) => {
          const SubIcon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.to}
              onClick={onSubItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[10px] transition-all duration-200 ${
                  isActive
                    ? "text-[#4f46ff] bg-[#f1efff] font-semibold"
                    : "text-slate-500 hover:text-[#10174f] hover:bg-slate-50 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {SubIcon && <SubIcon size={15} strokeWidth={isActive ? 2.5 : 2} />}
                  <span className="text-[13px]">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({ totalUnread, onClose }) {
  return (
    <>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-[12px] bg-[#4f46ff] flex items-center justify-center text-white shadow-sm shrink-0">
          <ShieldCheck size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-[16px] font-bold text-[#10174f] leading-none">Admin Dash</h1>
          <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Espace Pro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-1">
          <MenuItem to="/" label="Tableau de bord" icon={Home} onClick={onClose} />

          <DropdownMenu
            label="Ventes"
            icon={ShoppingBag}
            subItems={[
              { to: "/orders", label: "Cmd. Produits", icon: ShoppingCart },
              { to: "/formations_demande", label: "Réservations", icon: BookOpen }
            ]}
            onSubItemClick={onClose}
          />

          {/* ===== NOUVEAU : ACHATS ===== */}
          <DropdownMenu
            label="Achats"
            icon={Truck}
            subItems={[
              { to: "/suppliers", label: "Fournisseurs", icon: Users },
              { to: "/purchase-orders", label: "Bons de commande", icon: ClipboardList }
            ]}
            onSubItemClick={onClose}
          />

          <MenuItem to="/products" label="Produits" icon={Package} onClick={onClose} />
          <MenuItem to="/customers" label="Clients" icon={Users} onClick={onClose} />
          <MenuItem to="/stock" label="Stock" icon={Boxes} onClick={onClose} />
          <MenuItem to="/invoices" label="Factures" icon={Receipt} onClick={onClose} />

          <div className="h-4" />
          <p className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Communication</p>
          <MenuItem to="/discuss" label="Messages" icon={MessageCircle} badge={totalUnread} onClick={onClose} />

          <div className="h-4" />
          <p className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Ressources</p>
          <MenuItem to="/formations" label="Formations" icon={BookOpen} onClick={onClose} />
          <MenuItem to="/SdsNexus" label="SDS Nexus" icon={Network} onClick={onClose} />

          <div className="h-4" />
          <p className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">Configuration</p>
          <MenuItem to="/analytics" label="Analyse" icon={BarChart3} onClick={onClose} />
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [totalUnread, setTotalUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchTotalUnread = async () => {
    try {
      const response = await api.post('/api/chat/channels', { params: {} });
      if (response.data.result?.success) {
        const channels = response.data.result.data;
        const total = channels.reduce((sum, ch) => sum + (ch.unread_count || 0), 0);
        setTotalUnread(total);
      }
    } catch (error) {
      console.error("Erreur calcul badges sidebar :", error);
    }
  };

  useEffect(() => {
    fetchTotalUnread();
    const interval = setInterval(fetchTotalUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-white border-r border-[#ececf5] rounded-r-[24px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] px-4 py-6 sticky top-0 shrink-0">
        <SidebarContent totalUnread={totalUnread} onClose={() => {}} />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-[12px] border border-[#ececf5] shadow-sm flex items-center justify-center text-[#10174f]"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[280px] bg-white shadow-2xl flex flex-col px-4 py-6 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-[10px] border border-[#ececf5] flex items-center justify-center text-slate-400 hover:text-[#10174f] transition-colors"
        >
          <X size={18} />
        </button>
        <SidebarContent totalUnread={totalUnread} onClose={() => setMobileOpen(false)} />
      </div>
    </>
  );
}