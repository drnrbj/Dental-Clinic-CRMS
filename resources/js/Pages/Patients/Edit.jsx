import { useEffect } from 'react'
import { Link, usePage, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400'

const selectClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700'

const textareaClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none'

const SECTION_HEADING = 'text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6'

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

export default function PatientEdit() {
  const { patient, flash } = usePage().props

  const form = useForm({
    first_name:                     patient.first_name ?? '',
    middle_name:                    patient.middle_name ?? '',
    last_name:                      patient.last_name ?? '',
    birthdate:                      patient.birthdate ?? '',
    gender:                         patient.gender ?? '',
    civil_status:                   patient.civil_status ?? '',
    mobile_number:                  patient.mobile_number ?? '',
    email:                          patient.email ?? '',
    address:                        patient.address ?? '',
    emergency_contact_name:         patient.emergency_contact_name ?? '',
    emergency_contact_relationship: patient.emergency_contact_relationship ?? '',
    emergency_contact_number:       patient.emergency_contact_number ?? '',
    allergies:                      patient.allergies ?? '',
    medical_conditions:             patient.medical_conditions ?? '',
    current_medications:            patient.current_medications ?? '',
    dentist_notes:                  patient.dentist_notes ?? '',
  })

  const age =
    form.data.birthdate
      ? Math.floor((Date.now() - new Date(form.data.birthdate)) / 31557600000)
      : null

  const handleSubmit = (e) => {
    e.preventDefault()
    form.put(`/patients/${patient.id}`)
  }

  return (
    <AppLayout title={`Edit — ${patient.full_name ?? 'Patient'}`}>
      {/* Flash */}
      {flash?.success && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {flash.success}
        </div>
      )}

      {/* Back */}
      <Link
        href={`/patients/${patient.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {patient.full_name ?? 'Patient Profile'}
      </Link>

      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Patient</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">{patient.patient_code}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {/* ── PERSONAL INFORMATION ── */}
          <p className={SECTION_HEADING}>Personal Information</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>First Name</Label>
              <input
                type="text"
                value={form.data.first_name}
                onChange={e => form.setData('first_name', e.target.value)}
                className={inputClass}
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
              />
            </div>
            <div>
              <Label required>Last Name</Label>
              <input
                type="text"
                value={form.data.last_name}
                onChange={e => form.setData('last_name', e.target.value)}
                className={inputClass}
              />
              <FieldError message={form.errors.last_name} />
            </div>
          </div>

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
            <div>
              <Label required>Gender</Label>
              <select
                value={form.data.gender}
                onChange={e => form.setData('gender', e.target.value)}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <FieldError message={form.errors.gender} />
            </div>
          </div>

          <div className="mt-4 sm:w-1/2">
            <Label>Civil Status</Label>
            <select
              value={form.data.civil_status}
              onChange={e => form.setData('civil_status', e.target.value)}
              className={selectClass}
            >
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
            </select>
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
                placeholder="09XXXXXXXXX"
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
            />
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
            </div>
            <div>
              <Label required>Contact Number</Label>
              <input
                type="tel"
                value={form.data.emergency_contact_number}
                onChange={e => form.setData('emergency_contact_number', e.target.value)}
                className={inputClass}
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
            </div>
            <div>
              <Label>Existing Medical Conditions</Label>
              <textarea
                value={form.data.medical_conditions}
                onChange={e => form.setData('medical_conditions', e.target.value)}
                className={textareaClass}
                rows={2}
              />
            </div>
            <div>
              <Label>Current Medications</Label>
              <textarea
                value={form.data.current_medications}
                onChange={e => form.setData('current_medications', e.target.value)}
                className={textareaClass}
                rows={2}
              />
            </div>
            <div>
              <Label>Notes for Dentist</Label>
              <textarea
                value={form.data.dentist_notes}
                onChange={e => form.setData('dentist_notes', e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-gray-100">
            <Link
              href={`/patients/${patient.id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <SubmitButton 
              processing={form.processing} 
              label="Save Changes" 
              loadingLabel="Saving..." 
            />
          </div>
        </form>
      </div>
    </AppLayout>
  )
}