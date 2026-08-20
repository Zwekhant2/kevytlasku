import { Link } from 'react-router-dom'

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <svg
        className="empty-state-icon"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z"
          strokeLinejoin="round"
        />
        <path d="M14 3.5V8h4.5" strokeLinejoin="round" />
        <path d="M9 13h6M9 16.5h4" strokeLinecap="round" />
      </svg>
      <p className="empty-state-title">{title}</p>
      {message && <p className="empty-state-message">{message}</p>}
      {actionLabel && actionTo && (
        <Link className="button" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
