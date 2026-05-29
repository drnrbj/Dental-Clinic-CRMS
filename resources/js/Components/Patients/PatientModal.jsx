import { useEffect } from 'react'
import { useForm } from '@inertiajs/react'

const SECTION_HEADING = 'text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400'

const selectClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700'

const textareaClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none'

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-red-500 text-xs mt-1">{message}</p>
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

export default function PatientModal({ onClose }) {
  const form = useForm({
    first_name: '',
    middle_name: '',
    last_name: '',
    birthdate: '',
    gender: '',
    civil_status: '',
    mobile_number: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_number: '',
    allergies: '',
    medical_conditions: '',
    current_medications: '',
    dentist_notes: '',
  })

  // Compute age from birthdate
  const age =
    form.data.birthdate
      ? Math.floor((Date.now() - new Date(form.data.birthdate)) / 31557600000)
      : null

  // Escape key closes modal
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    form.post('/patients', {
      onSuccess: () => {
        form.reset()
        onClose()
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add New Patient</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the patient's details below</p>
          </div>
          <button
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
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* ── PERSONAL INFORMATION ── */}
          <p className={SECTION_HEADING}>Personal Information</p>

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>First Name</Label>
              <input
                type="text"
                value={form.data.first_name}
                onChange={e => form.setData('first_name', e.target.value)}
                className={inputClass}
                placeholder="e.g. Maria"
              />
              <FieldError message={form.errors.first_name} />
            </div>
            <div>
              <Label>Middle Name</Label>
              <input
                type="text"
                value={form.data.middle_name}
                onChange={e => form.setData('middle_name', e.target.value)}
                className={inputClass}
                placeholder="e.g. Cruz"
              />
              <FieldError message={form.errors.middle_name} />
            </div>
            <div>
              <Label required>Last Name</Label>
              <input
                type="text"
                value={form.data.last_name}
                onChange={e => form.setData('last_name', e.target.value)}
                className={inputClass}
                placeholder="e.g. Santos"
              />
              <FieldError message={form.errors.last_name} />
            </div>
          </div>

          {/* Birthdate + Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label required>Birthdate</Label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={form.data.birthdate}
                  onChange={e => form.setData('birthdate', e.target.value)}
                  className={inputClass}
                />
                {age !== null && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">Age: {age}</span>
                )}
              </div>
              <FieldError message={form.errors.birthdate} />
            </div>

            {/* Gender */}
            <div>
              <Label required>Gender</Label>
              <select
                value={form.data.gender}
                onChange={e => form.setData('gender', e.target.value)}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <FieldError message={form.errors.gender} />
            </div>
          </div>

          {/* Civil status */}
          <div className="mt-4 sm:w-1/2">
            <Label>Civil Status</Label>
            <select
              value={form.data.civil_status}
              onChange={e => form.setData('civil_status', e.target.value)}
              className={selectClass}
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
            <FieldError message={form.errors.civil_status} />
          </div>

          {/* ── CONTACT INFORMATION ── */}
          <p className={SECTION_HEADING}>Contact Information</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Mobile Number</Label>
              <input
                type="tel"
                value={form.data.mobile_number}
                onChange={e => form.setData('mobile_number', e.target.value)}
                className={inputClass}
                placeholder="09XX-XXX-XXXX"
              />
              <FieldError message={form.errors.mobile_number} />
            </div>
            <div>
              <Label>Email Address</Label>
              <input
                type="email"
                value={form.data.email}
                onChange={e => form.setData('email', e.target.value)}
                className={inputClass}
                placeholder="optional"
              />
              <FieldError message={form.errors.email} />
            </div>
          </div>

          <div className="mt-4">
            <Label>Complete Address</Label>
            <textarea
              value={form.data.address}
              onChange={e => form.setData('address', e.target.value)}
              className={textareaClass}
              rows={2}
              placeholder="House/Unit No., Street, Barangay, City, Province"
            />
            <FieldError message={form.errors.address} />
          </div>

          {/* ── EMERGENCY CONTACT ── */}
          <p className={SECTION_HEADING}>Emergency Contact</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>Contact Name</Label>
              <input
                type="text"
                value={form.data.emergency_contact_name}
                onChange={e => form.setData('emergency_contact_name', e.target.value)}
                className={inputClass}
                placeholder="Full name"
              />
              <FieldError message={form.errors.emergency_contact_name} />
            </div>
            <div>
              <Label>Relationship</Label>
              <select
                value={form.data.emergency_contact_relationship}
                onChange={e => form.setData('emergency_contact_relationship', e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
              <FieldError message={form.errors.emergency_contact_relationship} />
            </div>
            <div>
              <Label required>Contact Number</Label>
              <input
                type="tel"
                value={form.data.emergency_contact_number}
                onChange={e => form.setData('emergency_contact_number', e.target.value)}
                className={inputClass}
                placeholder="09XX-XXX-XXXX"
              />
              <FieldError message={form.errors.emergency_contact_number} />
            </div>
          </div>

          {/* ── MEDICAL INFORMATION ── */}
          <p className={SECTION_HEADING}>Medical Information</p>

          <div className="space-y-4">
            <div>
              <Label>Known Allergies</Label>
              <textarea
                value={form.data.allergies}
                onChange={e => form.setData('allergies', e.target.value)}
                className={textareaClass}
                rows={2}
                placeholder="List allergies, or type 'None'"
              />
              <FieldError message={form.errors.allergies} />
            </div>
            <div>
              <Label>Existing Medical Conditions</Label>
              <textarea
                value={form.data.medical_conditions}
                onChange={e => form.setData('medical_conditions', e.target.value)}
                className={textareaClass}
                rows={2}
                placeholder="e.g. Hypertension, Diabetes, etc."
              />
              <FieldError message={form.errors.medical_conditions} />
            </div>
            <div>
              <Label>Current Medications</Label>
              <textarea
                value={form.data.current_medications}
                onChange={e => form.setData('current_medications', e.target.value)}
                className={textareaClass}
                rows={2}
                placeholder="List medications currently taken, or type 'None'"
              />
              <FieldError message={form.errors.current_medications} />
            </div>
            <div>
              <Label>Notes for Dentist</Label>
              <textarea
                value={form.data.dentist_notes}
                onChange={e => form.setData('dentist_notes', e.target.value)}
                className={textareaClass}
                rows={3}
                placeholder="Any special notes or concerns for the dentist..."
              />
              <FieldError message={form.errors.dentist_notes} />
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Patient</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}