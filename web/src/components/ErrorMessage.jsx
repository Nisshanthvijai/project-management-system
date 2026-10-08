import { errorText } from '../lib/format.js';

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <span>{typeof error === 'string' ? error : errorText(error)}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline">
          Retry
        </button>
      )}
    </div>
  );
}
