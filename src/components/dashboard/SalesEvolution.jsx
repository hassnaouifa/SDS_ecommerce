import React, { useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Image as ImageIcon, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatCurrency } from "../../utils/formatters";

export default function SalesEvolution({ monthlySales, year }) {
  const chartRef = useRef(null);

  const downloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff" });
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `Evolution_Ventes_${year}.png`;
    link.click();
  };

  const downloadPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.setFontSize(16);
    pdf.text(`Rapport des Ventes - ${year}`, 15, 15);
    pdf.addImage(imgData, "PNG", 15, 25, pdfWidth - 30, pdfHeight - (30 * pdfHeight / pdfWidth));
    pdf.save(`Evolution_Ventes_${year}.pdf`);
  };

  return (
    <div className="xl:col-span-5 bg-white rounded-[24px] border border-[#ececf5] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <h3 className="text-[16px] font-bold text-[#10174f]">Évolution des ventes</h3>
        <div className="flex items-center gap-2">
          <button onClick={downloadImage} title="Télécharger en PNG" className="p-2 rounded-full border border-[#ececf5] text-slate-400 hover:text-[#4f46ff] hover:bg-[#f1efff] transition-colors">
            <ImageIcon size={16} />
          </button>
          <button onClick={downloadPDF} title="Télécharger en PDF" className="p-2 rounded-full border border-[#ececf5] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <FileText size={16} />
          </button>
          <button className="px-4 py-1.5 rounded-full border border-[#ececf5] text-emerald-500 bg-emerald-50 text-sm font-medium">En direct</button>
        </div>
      </div>
      <div className="h-[280px]" ref={chartRef} style={{ padding: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sessionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#4f46ff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
            <Tooltip formatter={(value) => [formatCurrency(value), "Chiffre d'affaires"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
            <Area type="monotone" dataKey="value" stroke="#4f46ff" fill="url(#sessionFill)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}