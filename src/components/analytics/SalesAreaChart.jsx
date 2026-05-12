import React, { useState, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts"; // 👈 On a retiré "Brush" d'ici
import BlockTitle from "../BlockTitle";
import { formatCurrency } from "../../utils/formatters";
import { Download, Image as ImageIcon, FileText, Calendar } from "lucide-react";
import html2canvas from "html2canvas";

// 🛠️ Traducteur intelligent pour comprendre les mois en français
const getMonthIndex = (monthName) => {
  if (!monthName) return -1;
  const name = monthName.toLowerCase();
  if (name.startsWith("jan")) return 0;
  if (name.startsWith("fév") || name.startsWith("fev")) return 1;
  if (name.startsWith("mar")) return 2;
  if (name.startsWith("avr")) return 3;
  if (name.startsWith("mai")) return 4;
  if (name.startsWith("juin")) return 5;
  if (name.startsWith("juil")) return 6;
  if (name.startsWith("aoû") || name.startsWith("aou")) return 7;
  if (name.startsWith("sep")) return 8;
  if (name.startsWith("oct")) return 9;
  if (name.startsWith("nov")) return 10;
  if (name.startsWith("déc") || name.startsWith("dec")) return 11;
  return -1;
};

export default function SalesAreaChart({ data = [] }) {
  const chartRef = useRef(null);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Logique de filtrage des données corrigée
  const filteredData = useMemo(() => {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      const itemMonthIdx = getMonthIndex(item.name);
      
      if (itemMonthIdx !== -1) {
        if (startDate) {
          const startMonth = new Date(startDate).getMonth();
          if (itemMonthIdx < startMonth) return false;
        }
        if (endDate) {
          const endMonth = new Date(endDate).getMonth();
          if (itemMonthIdx > endMonth) return false;
        }
        return true;
      }
      
      const itemDate = new Date(item.name);
      if (!isNaN(itemDate.getTime())) {
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        return true;
      }
      
      return true; 
    });
  }, [data, startDate, endDate]);

  const averageValue = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    return total / filteredData.length;
  }, [filteredData]);

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["Période,Chiffre d'affaires (MAD)"];
    const rows = filteredData.map((item) => `${item.name},${item.value}`);
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `export_ca_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToImage = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `graphe_ca_${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error("Erreur exportation image", error);
    }
    setShowExportMenu(false);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#ececf5] p-5 relative shadow-sm">
      
      {/* --- En-tête --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <BlockTitle
          title="Évolution du chiffre d'affaires"
          subtitle="Analyse détaillée avec filtres et exportations"
        />

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filtre Date */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-[#4f46ff] focus-within:ring-1 focus-within:ring-[#4f46ff]">
            <Calendar size={16} className="text-[#4f46ff]" />
            
            <input
              type="date"
              className="bg-transparent text-[13px] text-[#10174f] font-semibold outline-none cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            
            <span className="text-slate-400 text-xs font-bold px-1">au</span>
            
            <input
              type="date"
              className="bg-transparent text-[13px] text-[#10174f] font-semibold outline-none cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            {(startDate || endDate) && (
              <button 
                onClick={clearDates}
                className="ml-2 w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-red-500 hover:text-white text-gray-500 rounded-full text-xs font-bold transition-colors"
                title="Effacer les dates"
              >
                ✕
              </button>
            )}
          </div>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-[#10174f] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1a257a] transition-all shadow-sm hover:shadow-md"
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button onClick={exportToImage} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#4f46ff] transition-colors text-left">
                  <ImageIcon size={16} /> <span>Image (PNG)</span>
                </button>
                <button onClick={exportToCSV} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#4f46ff] transition-colors text-left border-t border-slate-50">
                  <FileText size={16} /> <span>Fichier CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Graphe --- */}
      <div ref={chartRef} className="p-2 bg-white rounded-xl">
        <div className="h-[400px]">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4f46ff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececf5" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickMargin={10} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value / 1000}k`} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={60} />
                <Tooltip formatter={(value) => [formatCurrency(value), "Chiffre d'affaires"]} contentStyle={{ borderRadius: '16px', border: '1px solid #ececf5', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                
                <ReferenceLine y={averageValue} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Moyenne', fill: '#f59e0b', fontSize: 12, fontWeight: 'bold' }} />
                
                <Area type="monotone" dataKey="value" stroke="#4f46ff" fill="url(#salesFill)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46ff', style: {filter: 'drop-shadow(0px 4px 8px rgba(79, 70, 255, 0.4))'} }} />
                
                {/* 👈 La balise <Brush /> a été totalement supprimée ici */}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Calendar size={40} className="text-slate-300 mb-3" />
              <p className="font-medium text-sm">Aucun chiffre d'affaires pour cette période.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}