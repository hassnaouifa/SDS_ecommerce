import React from "react";
import Modal from "../../ui/Modal";

export default function AddFeeModal({ open, onClose, feeName, setFeeName, feeAmount, setFeeAmount, onAdd, actionLoading }) {
  return (
    <Modal open={open} title="Ajouter un frais" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="text"
          value={feeName}
          onChange={(e) => setFeeName(e.target.value)}
          placeholder="Nom du frais (ex: Livraison)"
          className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={feeAmount}
          onChange={(e) => setFeeAmount(e.target.value)}
          placeholder="Montant"
          className="w-full h-12 rounded-[18px] bg-[#fafafe] border border-[#ececf5] px-4 outline-none focus:border-[#4f46ff]"
        />
        <button
          onClick={onAdd}
          disabled={actionLoading}
          className="w-full h-12 rounded-full bg-[#22c55e] text-white disabled:opacity-60 transition"
        >
          {actionLoading ? "Ajout..." : "Ajouter le frais"}
        </button>
      </div>
    </Modal>
  );
}