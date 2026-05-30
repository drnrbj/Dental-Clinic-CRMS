import { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400'

const selectClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700'

const textareaClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none'

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-red-500 text-xs mt-1">{message}</p>
}

const APPOINTMENT_TYPES = [
  { value: 'cleaning',      label: 'Cleaning' },
  { value: 'checkup',       label: 'Check-up' },
  { value: 'extraction',    label: 'Extraction' },
  { value: 'filling',       label: 'Filling' },
  { value: 'root_canal',    label: 'Root Canal' },
  { value: 'orthodontic',   label: 'Orthodontic' },
  { value: 'whitening',     label: 'Whitening' },
  { value: 'consultation',  label: 'Consultation' },
]

export default function AppointmentModal({ open, onClose, defaultDate, dentists = [], onSuccess }) {
  const form = useForm({
    patient_id:        '',
    dentist_id:        '',
    appointment_date:  defaultDate || '',
    appointment_time:  '',
    duration_minutes:  60,
    type:              '',
    remarks:           '',
  })

  // ── Patient search state ──────────────────────────────────────────────────
  const [patientSearch, setPatientSearch]   = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showDropdown, setShowDropdown]     = useState(false)

  // ── Slot state ────────────────────────────────────────────────────────────
  const [slots, setSlots]           = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Pre-fill date from calendar click
  useEffect(() => {
    if (defaultDate) form.setData('appointment_date', defaultDate)
  }, [defaultDate])

  // ── Patient autocomplete ──────────────────────────────────────────────────
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([])
      setShowDropdown(false)
      return
    }
    const debounce = setTimeout(() => {
      fetch(`/patients?search=${encodeURIComponent(patientSearch)}&per_page=5&status=active`, {
        headers: { 'Accept': 'application/json' },
      })
        .then(r => r.json())
        .then(data => {
          setPatientResults(data.data ?? [])
          setShowDropdown(true)
        })
    }, 300)
    return () => clearTimeout(debounce)
  }, [patientSearch])

  const selectPatient = (patient) => {
    setSelectedPatient(patient)
    setPatientSearch(patient.full_name)
    setShowDropdown(false)
    form.setData('patient_id', patient.id)
  }

  // ── Available slots ───────────────────────────────────────────────────────
  const loadSlots = (dentistId, date) => {
    if (!dentistId || !date) return
    setLoadingSlots(true)
    fetch(`/appointments/available-slots?dentist_id=${dentistId}&date=${date}`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        setSlots(data)
        // Clear selected time if it's now unavailable
        const still = data.find(s => s.time === form.data.appointment_time)
        if (!still?.available) form.setData('appointment_time', '')
      })
      .finally(() => setLoadingSlots(false))
  }

  const handleDentistChange = (e) => {
    const id = e.target.value
    form.setData('dentist_id', id)
    loadSlots(id, form.data.appointment_date)
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    form.setData('appointment_date', date)
    loadSlots(form.data.dentist_id, date)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    form.post('/appointments', {
      onSuccess: () => {
        form.reset()
        setSelectedPatient(null)
        setPatientSearch('')
        setSlots([])
        onSuccess?.()
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">New Appointment</h2>
            <p className="text-xs text-gray-500 mt-0.5">Schedule a new appointment</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Patient search */}
          <div>
            <Label required>Patient</Label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={patientSearch}
                onChange={e => {
                  setPatientSearch(e.target.value)
                  if (selectedPatient) {
                    setSelectedPatient(null)
                    form.setData('patient_id', '')
                  }
                }}
                onFocus={() => patientResults.length > 0 && setShowDropdown(true)}
                className={`${inputClass} pl-9 ${selectedPatient ? 'border-green-300 bg-green-50' : ''}`}
                placeholder="Type patient name or ID..."
                autoComplete="off"
              />

              {/* Selected indicator */}
              {selectedPatient && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Dropdown */}
              {showDropdown && patientResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {patientResults.map(patient => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => selectPatient(patient)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{patient.full_name}</p>
                      <p className="text-xs text-gray-400">{patient.patient_code} · {patient.display_mobile}</p>
                    </button>
                  ))}
                </div>
              )}

              {showDropdown && patientSearch.length >= 2 && patientResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 px-4 py-3">
                  <p className="text-sm text-gray-400">No patients found for "{patientSearch}"</p>
                </div>
              )}
            </div>
            <FieldError message={form.errors.patient_id} />
          </div>

          {/* Dentist */}
          <div>
            <Label required>Dentist</Label>
            <select value={form.data.dentist_id} onChange={handleDentistChange} className={selectClass}>
              <option value="">Select dentist</option>
              {dentists.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <FieldError message={form.errors.dentist_id} />
          </div>

          {/* Date */}
          <div>
            <Label required>Date</Label>
            <input
              type="date"
              value={form.data.appointment_date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
            <FieldError message={form.errors.appointment_date} />
          </div>

          {/* Time slots */}
          <div>
            <Label required>Time</Label>
            <select
              value={form.data.appointment_time}
              onChange={e => form.setData('appointment_time', e.target.value)}
              className={selectClass}
              disabled={loadingSlots}
            >
              <option value="">
                {loadingSlots
                  ? 'Checking availability...'
                  : slots.length === 0
                    ? 'Select dentist and date first'
                    : 'Select a time slot'}
              </option>
              {slots.map(slot => (
                <option
                  key={slot.time}
                  value={slot.time}
                  disabled={!slot.available}
                  className={!slot.available ? 'text-gray-400' : ''}
                >
                  {slot.label}{!slot.available ? ' (Unavailable)' : ''}
                </option>
              ))}
            </select>
            <FieldError message={form.errors.appointment_time} />
          </div>

          {/* Type */}
          <div>
            <Label required>Appointment Type</Label>
            <select value={form.data.type} onChange={e => form.setData('type', e.target.value)} className={selectClass}>
              <option value="">Select type</option>
              {APPOINTMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <FieldError message={form.errors.type} />
          </div>

          {/* Remarks */}
          <div>
            <Label>Remarks</Label>
            <textarea
              value={form.data.remarks}
              onChange={e => form.setData('remarks', e.target.value)}
              className={textareaClass}
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.processing}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {form.processing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scheduling...
                </>
              ) : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}