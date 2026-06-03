import { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import TreatmentModal from '@/Components/Treatments/TreatmentModal'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

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

function StatusPill({ status }) {
  const map = {
    confirmed: 'bg-blue-50 text-blue-700',
    ongoing:   'bg-purple-50 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status === 'ongoing' ? 'In Progress' : 'Confirmed'}
    </span>
  )
}

function Pagination({ links }) {
  if (!links || links.length <= 3) return null
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {links.map((link, i) => (
        <Link
          key={i}
          href={link.url ?? '#'}
          preserveScroll
          className={`px-3 py-1.5 text-xs rounded-md transition-colors
            ${!link.url ? 'text-gray-300 pointer-events-none' : ''}
            ${link.active ? 'bg-blue-600 text-white font-medium' : link.url ? 'text-gray-600 hover:bg-gray-100' : ''}`}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </div>
  )
}

export default function MyTreatments() {
  const { readyToTreat, treatmentHistory, flash, auth } = usePage().props
  const user = auth.user

  const [treatmentModal, setTreatmentModal]         = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState(null)
  const [flashDismissed, setFlashDismissed]         = useState(false)
  const [startingId, setStartingId]                 = useState(null)
  const [startError, setStartError]                 = useState('')

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? ''

  const handleStart = (appt) => {
    // If already ongoing, jump straight to modal
    if (appt.status === 'ongoing') {
      setCurrentAppointment(appt)
      setTreatmentModal(true)
      return
    }

    setStartingId(appt.id)
    setStartError('')

    fetch(`/appointments/${appt.id}/status`, {
      method:  'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept':       'application/json',
      },
      body: JSON.stringify({ status: 'ongoing' }),
    })
      .then(r => {
        // 403 guard
        if (r.status === 403) {
          throw new Error('You do not have permission to start this treatment.')
        }
        return r.json()
      })
      .then(data => {
        if (data.success) {
          setCurrentAppointment({ ...appt, status: 'ongoing' })
          setTreatmentModal(true)
        } else {
          setStartError(data.message ?? 'Something went wrong.')
        }
      })
      .catch(err => {
        setStartError(err.message)
      })
      .finally(() => setStartingId(null))
  }

  return (
    <AppLayout title="My Treatments">
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

      {/* Error display */}
      {startError && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {startError}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Treatments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Section 1: Ready to Treat ── */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Ready to Treat
          {readyToTreat.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium normal-case">
              {readyToTreat.length} appointment{readyToTreat.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>

        {readyToTreat.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <EmptyState
              icon={<Icons.Check />}
              title="No confirmed appointments today"
              description="Check the Appointments calendar for upcoming schedule."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyToTreat.map(appt => (
              <div key={appt.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{appt.patient_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{appt.time_slot}</p>
                  </div>
                  <StatusPill status={appt.status} />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {TYPE_DISPLAY[appt.type] ?? appt.type_display}
                  </span>
                </div>

                {appt.remarks && (
                  <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">{appt.remarks}</p>
                )}

                {appt.has_treatment ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Treatment already recorded
                  </div>
                ) : (
                  can(user, 'treatments.create') ? (
                    <button
                      onClick={() => handleStart(appt)}
                      disabled={startingId === appt.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {startingId === appt.id ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Starting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start &amp; Record Treatment
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 text-center italic py-2">View only</p>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 2: Treatment History ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Treatment History
        </h2>

        {treatmentHistory.data.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <EmptyState
              icon={<Icons.Clipboard />}
              title="No treatments recorded yet"
              description="Treatments will appear here after they are recorded."
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatmentHistory.data.map(t => (
                <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.patient_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 whitespace-nowrap">{t.cost_display}</span>
                  </div>

                  <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2">
                    {t.procedure_display}
                  </span>

                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{t.diagnosis_truncated}</p>

                  <Link
                    href={`/treatments/${t.id}`}
                    className="mt-3 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View full record →
                  </Link>
                </div>
              ))}
            </div>
            <Pagination links={treatmentHistory.links} />
          </>
        )}
      </div>

      {/* Treatment Modal */}
      {treatmentModal && currentAppointment && (
        <TreatmentModal
          open={treatmentModal}
          onClose={() => { setTreatmentModal(false); setCurrentAppointment(null) }}
          appointment={currentAppointment}
          onSuccess={() => router.reload()}
        />
      )}
    </AppLayout>
  )
}