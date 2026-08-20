import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  // end: true on both — otherwise '/invoices' prefix-matches '/invoices/new'
  // (and any invoice detail/edit route) and two nav items light up at once.
  { to: '/invoices', label: 'Invoices', end: true },
  { to: '/invoices/new', label: 'New invoice', end: true },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <span className="app-brand">
          <span className="app-brand-mark" aria-hidden="true">
            kL
          </span>
          kevytlasku
        </span>
        <nav className="app-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
