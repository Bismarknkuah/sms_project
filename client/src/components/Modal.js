function Modal({ isOpen, onClose, title, children, onSubmit, submitText = 'Save' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">✖</button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
          <button onClick={onSubmit} className="btn bg-gradient-to-r from-indigo-500 to-purple-800 text-white px-4 py-2 rounded-md">{submitText}</button>
        </div>
      </div>
    </div>
  );
}