import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import ErrorMessage from '../components/ErrorMessage'

export default function Settings() {
  const { settings, loading } = useSettings()

  if (loading || !settings) {
    return <p className="list-status">Loading settings…</p>
  }

  return <SettingsFields settings={settings} />
}

function SettingsFields({ settings }) {
  const { saveSettings } = useSettings()
  const { showToast } = useToast()

  const [companyName, setCompanyName] = useState(settings.companyName)
  const [iban, setIban] = useState(settings.iban ?? '')
  const [bic, setBic] = useState(settings.bic ?? '')
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    try {
      await saveSettings({
        companyName,
        iban: iban.trim() || null,
        bic: bic.trim() || null,
      })
      showToast('Payment details saved')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-enter">
      <h1>Settings</h1>

      <form className="invoice-form" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>Payment details</legend>
          <p className="form-hint">Shown on every invoice&apos;s &quot;Pay to&quot; panel, so clients know where to send payment.</p>
          <div className="field-grid">
            <label className="field">
              Company name
              <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </label>
            <label className="field">
              IBAN
              <input className="input" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="FI21 1234 5600 0007 85" />
            </label>
            <label className="field">
              BIC / SWIFT
              <input className="input" value={bic} onChange={(e) => setBic(e.target.value)} placeholder="NDEAFIHH" />
            </label>
          </div>
        </fieldset>

        {submitError && <ErrorMessage message={submitError} />}

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </section>
  )
}
