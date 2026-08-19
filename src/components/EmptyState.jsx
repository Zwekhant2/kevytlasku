import { Link } from 'react-router-dom'

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
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
