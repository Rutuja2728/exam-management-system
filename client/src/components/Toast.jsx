export default function Toast({ type = 'success', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`} role="status">
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
