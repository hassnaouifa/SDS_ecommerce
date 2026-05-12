import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import { UploadCloud, X } from "lucide-react";

export default function EditCustomerModal({ open, onClose, onEdit, actionLoading, customer }) {
  const [formData, setFormData] = useState({ id: "", name: "", email: "", phone: "", city: "" });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (customer && open) {
      setFormData({
        id: customer.id,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        city: customer.city || ""
      });
      if (customer.image_url) {
        setImage({ url: `/odoo-api${customer.image_url}`, base64: null });
      } else {
        setImage(null);
      }
    }
  }, [customer, open]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ url: reader.result, base64: reader.result.split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onEdit({ ...formData, image_1920: image?.base64 || null });
  };

  if (!customer) return null;

  return (
    <Modal open={open} title="Modifier le client" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative w-24 h-24 rounded-full bg-[#fafafe] border-2 border-dashed border-[#cfc8ff] flex items-center justify-center overflow-hidden group">
            {image ? (
              <>
                <img src={image.url} className="w-full h-full object-cover" alt="Avatar" />
                <button onClick={() => setImage(null)} className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-[#4f46ff]">
                <UploadCloud size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-400 ml-2 block">Nom complet *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 ml-2 block">Téléphone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-400 ml-2 block">Ville</label>
            <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]" />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={actionLoading || !formData.name} className="w-full h-14 rounded-full bg-[#4f46ff] text-white font-bold shadow-lg hover:bg-[#3b33e6] transition disabled:opacity-60">
          {actionLoading ? "Enregistrement..." : "Sauvegarder"}
        </button>
      </div>
    </Modal>
  );
}