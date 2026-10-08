export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-600" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
