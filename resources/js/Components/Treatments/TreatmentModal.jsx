import { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { SubmitButton } from '@/Components/Spinner'

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

const PROCEDURES = [
  { value: 'cleaning',          label: 'Cleaning' },
  { value: 'extraction',        label: 'Extraction' },
  { value: 'filling',           label: 'Filling' },
  { value: 'root_canal',        label: 'Root Canal' },
  { value: 'crown',             label: 'Crown' },
  { value: 'whitening',         label: 'Whitening' },
  { value: 'braces_adjustment', label: 'Braces Adjustment' },
  { value: 'consultation',      label: 'Consultation' },
]

const TYPE_DISPLAY = {
  cleaning:          'Cleaning',
  checkup:           'Check-up',
  extraction:        'Extraction',
  filling:           'Filling',
  root_canal:        'Root Canal',
  orthodontic:       'Orthodontic',
  whitening:         'Whitening',
  consultation:      'Consultation',
  braces_adjustment: 'Braces Adjustment',
}

export default function TreatmentModal({ open, onClose, appointment, onSuccess }) {
  const form = useForm({
    appointment_id: appointment?.id ?? '',
    diagnosis:      '',
    procedure:      appointment?.type ?? '',
    prescription:   '',
    clinical_notes: '',
    treatment_cost: '',
  })

  // Sync appointment_id if prop changes
  useEffect(() => {
    if (appointment?.id) {
      form.setData('appointment_id', appointment.id)
    }
  }, [appointment?.id])

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    form.post('/treatments', {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Record Treatment</h2>
            <p className="text-xs text-gray-500 mt-0.5">Document the treatment performed</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Appointment context (read-only) */}
        <div className="mx-6 mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Appointment</p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-blue-500 font-medium">Patient</p>
              <p className="text-blue-900 font-semibold mt-0.5">{appointment?.patient_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium">Date</p>
              <p className="text-blue-900 mt-0.5">{appointment?.time_slot ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium">Type</p>
              <p className="text-blue-900 mt-0.5">{TYPE_DISPLAY[appointment?.type] ?? appointment?.type_display ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Appointment validation error */}
        {form.errors.appointment_id && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{form.errors.appointment_id}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Diagnosis */}
          <div>
            <Label required>Diagnosis</Label>
            <textarea
              value={form.data.diagnosis}
              onChange={e => form.setData('diagnosis', e.target.value)}
              className={textareaClass}
              rows={3}
              placeholder="Describe the clinical diagnosis (minimum 10 characters)..."
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError message={form.errors.diagnosis} />
              <p className="text-xs text-gray-400 ml-auto">{form.data.diagnosis.length} chars</p>
            </div>
          </div>

          {/* Procedure */}
          <div>
            <Label required>Procedure Performed</Label>
            <select
              value={form.data.procedure}
              onChange={e => form.setData('procedure', e.target.value)}
              className={selectClass}
            >
              <option value="">Select procedure</option>
              {PROCEDURES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <FieldError message={form.errors.procedure} />
          </div>

          {/* Treatment cost */}
          <div>
            <Label required>Treatment Cost</Label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 font-medium">
                ₱
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.data.treatment_cost}
                onChange={e => form.setData('treatment_cost', e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none placeholder-gray-400"
                placeholder="0.00"
              />
            </div>
            <FieldError message={form.errors.treatment_cost} />
          </div>

          {/* Prescription */}
          <div>
            <Label>Prescription</Label>
            <textarea
              value={form.data.prescription}
              onChange={e => form.setData('prescription', e.target.value)}
              className={textareaClass}
              rows={3}
              placeholder="e.g., Amoxicillin 500mg – 3x daily for 5 days&#10;Ibuprofen 400mg – as needed for pain"
            />
            <FieldError message={form.errors.prescription} />
          </div>

          {/* Clinical notes */}
          <div>
            <Label>Clinical Notes</Label>
            <textarea
              value={form.data.clinical_notes}
              onChange={e => form.setData('clinical_notes', e.target.value)}
              className={textareaClass}
              rows={3}
              placeholder="Additional clinical observations, follow-up instructions..."
            />
            <FieldError message={form.errors.clinical_notes} />
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
            <SubmitButton 
              processing={form.processing} 
              label="Save Treatment" 
              loadingLabel="Saving..." 
            />
          </div>
        </form>
      </div>
    </div>
  )
}