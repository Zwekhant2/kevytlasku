export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <svg
        className="error-message-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <div>
        <p>{message ?? 'Something went wrong.'}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
