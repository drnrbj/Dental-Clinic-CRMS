import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import PersonalInfoTab from '@/Components/Patients/PersonalInfoTab'
import AppointmentHistoryTab from '@/Components/Patients/AppointmentHistoryTab'
import TreatmentHistoryTab from '@/Components/Patients/TreatmentHistoryTab'
import PaymentHistoryTab from '@/Components/Patients/PaymentHistoryTab'

const TABS = [
  { key: 'info',         label: 'Personal Info' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'treatments',   label: 'Treatments' },
  { key: 'payments',     label: 'Payments' },
]

export default function PatientShow() {
  const { patient, auth, flash } = usePage().props
  const user = auth.user
  const [activeTab, setActiveTab] = useState('info')
  const [flashDismissed, setFlashDismissed] = useState(false)

  return (
    <AppLayout title={patient.full_name}>
      {/* Flash */}
      {!flashDismissed && flash?.success && (
        <div className="flex items-center justify-between bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-4">
          <span className="text-sm">{flash.success}</span>
          <button onClick={() => setFlashDismissed(true)} className="text-green-500 hover:text-green-700 ml-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Patients
      </Link>

      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">
                {patient.first_name?.[0]}{patient.last_name?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{patient.full_name}</h1>
              <p className="font-mono text-sm text-gray-500 mt-0.5">{patient.patient_code}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {patient.is_active ? (
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">Active</span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Archived</span>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{patient.gender_display}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{patient.age} yrs old</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          {['admin', 'receptionist'].includes(user.role) && (
            <Link
              href={`/patients/${patient.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors self-start"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Patient
            </Link>
          )}
        </div>

        {/* Quick info row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Mobile</p>
            <p className="text-sm text-gray-800 mt-0.5 font-mono">{patient.display_mobile}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</p>
            <p className="text-sm text-gray-800 mt-0.5">{patient.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Birthdate</p>
            <p className="text-sm text-gray-800 mt-0.5">{patient.birthdate_display}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Patient Since</p>
            <p className="text-sm text-gray-800 mt-0.5">{patient.created_at}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
                ${activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }
              `}
            >
              {tab.label}
              {tab.key === 'appointments' && patient.appointments?.length > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {patient.appointments.length}
                </span>
              )}
              {tab.key === 'treatments' && patient.treatments?.length > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {patient.treatments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'info'         && <PersonalInfoTab patient={patient} user={user} />}
          {activeTab === 'appointments' && <AppointmentHistoryTab appointments={patient.appointments} />}
          {activeTab === 'treatments'   && <TreatmentHistoryTab treatments={patient.treatments} />}
          {activeTab === 'payments'     && <PaymentHistoryTab invoices={patient.invoices} />}
        </div>
      </div>
    </AppLayout>
  )
}