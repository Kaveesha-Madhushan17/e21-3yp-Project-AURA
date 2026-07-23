import { useState } from "react";
import { Star, X } from "lucide-react";

export default function StarRatingModal({ isOpen, onClose, onSubmit, isDark = true }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const D = isDark;

  const handleConfirm = async () => {
    if (selected === 0) return;
    setSubmitting(true);
    await onSubmit(selected);
    setSubmitting(false);
    setSelected(0);
    setHovered(0);
  };

  const handleCancel = () => {
    setSelected(0);
    setHovered(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative w-full max-w-sm rounded-3xl border shadow-2xl p-6 ${D ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-200"}`}>

        <button
          onClick={handleCancel}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${D ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6 mt-2">
          <h3 className={`text-xl font-bold mb-1 ${D ? "text-white" : "text-gray-900"}`}>
            How was your experience?
          </h3>
          <p className={`text-sm ${D ? "text-gray-400" : "text-gray-500"}`}>
            Rate us before you go
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelected(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform active:scale-90"
            >
              <Star
                size={40}
                className={
                  star <= (hovered || selected)
                    ? "text-yellow-400 fill-yellow-400"
                    : D ? "text-gray-600" : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${D ? "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected === 0 || submitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 disabled:opacity-40 transition-all active:scale-95"
          >
            {submitting ? "Submitting..." : "Confirm"}
          </button>
        </div>

      </div>
    </div>
  );
}
