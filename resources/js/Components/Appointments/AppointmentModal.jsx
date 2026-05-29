import { useEffect } from 'react'
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
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-red-500 text-xs mt-1">{message}</p>
}

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM',
]

const APPOINTMENT_TYPES = [
  'Cleaning',
  'Check-up',
  'Extraction',
  'Filling',
  'Root Canal',
  'Orthodontic',
  'Whitening',
  'Consultation',
]

const DENTISTS = [
  'Dr. Ana Reyes',
  'Dr. Marco Santos',
  'Dr. Liza Torres',
]

export default function AppointmentModal({ open, onClose, defaultDate }) {
  const form = useForm({
    patient_search:   '',
    dentist:          '',
    date:             defaultDate || '',
    time:             '',
    type:             '',
    notes:            '',
  })

  useEffect(() => {
    if (defaultDate) {
      form.setData('date', defaultDate)
    }
  }, [defaultDate])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    form.post('/appointments', {
      onSuccess: () => {
        form.reset()
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
            <p className="text-xs text-gray-500 mt-0.5">Fill in the appointment details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Patient search */}
          <div>
            <Label required>Patient</Label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={form.data.patient_search}
                onChange={e => form.setData('patient_search', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="Search patient by name or ID..."
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Live search will be wired in a later phase.</p>
            <FieldError message={form.errors.patient_search} />
          </div>

          {/* Dentist */}
          <div>
            <Label required>Dentist</Label>
            <select
              value={form.data.dentist}
              onChange={e => form.setData('dentist', e.target.value)}
              className={selectClass}
            >
              <option value="">Select dentist</option>
              {DENTISTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <FieldError message={form.errors.dentist} />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Date</Label>
              <input
                type="date"
                value={form.data.date}
                onChange={e => form.setData('date', e.target.value)}
                className={inputClass}
              />
              <FieldError message={form.errors.date} />
            </div>
            <div>
              <Label required>Time</Label>
              <select
                value={form.data.time}
                onChange={e => form.setData('time', e.target.value)}
                className={selectClass}
              >
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <FieldError message={form.errors.time} />
            </div>
          </div>

          {/* Type */}
          <div>
            <Label required>Appointment Type</Label>
            <select
              value={form.data.type}
              onChange={e => form.setData('type', e.target.value)}
              className={selectClass}
            >
              <option value="">Select type</option>
              {APPOINTMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <FieldError message={form.errors.type} />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <textarea
              value={form.data.notes}
              onChange={e => form.setData('notes', e.target.value)}
              className={textareaClass}
              rows={3}
              placeholder="Optional notes for this appointment..."
            />
            <FieldError message={form.errors.notes} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
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
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Schedule Appointment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}