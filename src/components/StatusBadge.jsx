const STATUS_LABEL = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
}

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{STATUS_LABEL[status] ?? status}</span>
}
