import { formatCurrency } from '../lib/format'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const WIDTH = 600
const HEIGHT = 140
const BAR_GAP = 16

export default function RevenueChart({ months }) {
  const max = Math.max(1, ...months.map((m) => m.total))
  const barWidth = (WIDTH - BAR_GAP * (months.length - 1)) / months.length

  return (
    <div className="revenue-chart-card">
      <p className="invoice-detail-label">Invoiced by month</p>
      <svg
        className="revenue-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 24}`}
        role="img"
        aria-label={`Invoiced total per month, last ${months.length} months`}
      >
        {months.map((m, i) => {
          const barHeight = m.total > 0 ? Math.max(6, (m.total / max) * HEIGHT) : 3
          const x = i * (barWidth + BAR_GAP)
          const y = HEIGHT - barHeight
          const isCurrent = i === months.length - 1
          return (
            <g key={`${m.year}-${m.month}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={5}
                className={isCurrent ? 'revenue-bar revenue-bar--current' : 'revenue-bar'}
              >
                <title>
                  {MONTH_LABELS[m.month]} {m.year}: {formatCurrency(m.total)}
                </title>
              </rect>
              <text x={x + barWidth / 2} y={HEIGHT + 20} textAnchor="middle" className="revenue-chart-label">
                {MONTH_LABELS[m.month]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
