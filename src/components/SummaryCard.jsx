export default function SummaryCard({ label, value, hint, tone }) {
  return (
    <div className={`summary-card${tone ? ` summary-card--${tone}` : ''}`}>
      <p className="summary-card-label">{label}</p>
      <p className="summary-card-value">{value}</p>
      {hint && <p className="summary-card-hint">{hint}</p>}
    </div>
  )
}
