import { useState } from 'react'
import { Link } from '@inertiajs/react'
import StatusBadge from '@/Components/StatusBadge'
import { can } from '@/Utils/can'

const TYPE_LABELS = {
  cleaning:     'Cleaning',
  checkup:      'Check-up',
  extraction:   'Extraction',
  filling:      'Filling',
  root_canal:   'Root Canal',
  orthodontic:  'Orthodontic',
  whitening:    'Whitening',
  consultation: 'Consultation',
}

function ActionButton({ onClick, disabled, variant = 'primary', children }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger:  'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
    gray:    'bg-gray-100 hover:bg-gray-200 text-gray-700',
    purple:  'bg-purple-600 hover:bg-purple-700 text-white',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

export default function AppointmentDetailPanel({ appointment, open, onClose, onStatusChange, auth }) {
  const [cancelMode, setCancelMode]     = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const user = auth?.user

  const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.content ?? ''

  const submitStatus = async (status) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      // 403 guard - add this before parsing JSON
      if (res.status === 403) {
        setError('You do not have permission to perform this action.')
        return
      }
      
      const data = await res.json()
      if (res.ok && data.success) {
        onStatusChange()
        onClose()
      } else {
        setError(data.message ?? 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled', cancelled_reason: cancelReason }),
      })
      
      // 403 guard - add this before parsing JSON
      if (res.status === 403) {
        setError('You do not have permission to cancel this appointment.')
        return
      }
      
      const data = await res.json()
      if (res.ok && data.success) {
        setCancelMode(false)
        setCancelReason('')
        onStatusChange()
        onClose()
      } else {
        setError(data.message ?? 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCancelMode(false)
    setCancelReason('')
    setError('')
    onClose()
  }

  const isTerminal = ['completed', 'cancelled', 'no_show'].includes(appointment?.status)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200
          z-40 overflow-y-auto transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {!appointment ? (
          <div className="flex items-center justify-center h-full">
            <svg className="w-6 h-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="p-6">
            {/* Panel header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Appointment</h2>
                <p className="text-xs text-gray-400 mt-0.5">{appointment.formatted_datetime}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Patient */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Patient</p>
              <Link
                href={`/patients/${appointment.patient?.id}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {appointment.patient?.full_name ?? '—'}
              </Link>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{appointment.patient?.display_mobile}</p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Dentist</p>
                <p className="text-sm text-gray-800">{appointment.dentist?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Type</p>
                <p className="text-sm text-gray-800">{TYPE_LABELS[appointment.type] ?? appointment.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Time Slot</p>
                <p className="text-sm text-gray-800">{appointment.time_slot}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Status</p>
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            {/* Remarks */}
            {appointment.remarks && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Remarks</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{appointment.remarks}</p>
              </div>
            )}

            {/* Cancelled reason */}
            {appointment.cancelled_reason && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs text-red-500 uppercase tracking-wide font-medium mb-1">Cancellation Reason</p>
                <p className="text-sm text-red-700">{appointment.cancelled_reason}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* ── Action buttons ── */}
            {isTerminal ? (
              <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-3 mb-4">
                This appointment is <span className="font-medium">{appointment.status.replace('_', ' ')}</span> and cannot be modified.
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {/* pending */}
                {appointment.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <ActionButton variant="primary" disabled={loading} onClick={() => submitStatus('confirmed')}>
                      ✓ Confirm
                    </ActionButton>
                    <ActionButton variant="danger" disabled={loading} onClick={() => { setCancelMode(true); setError('') }}>
                      Cancel
                    </ActionButton>
                  </div>
                )}

                {/* confirmed */}
                {appointment.status === 'confirmed' && (
                  <div className="flex flex-wrap gap-2">
                    {/* Start Treatment button - now using can() */}
                    {can(user, 'appointments.start') && (
                      <ActionButton variant="purple" disabled={loading} onClick={() => submitStatus('ongoing')}>
                        ▶ Start Treatment
                      </ActionButton>
                    )}
                    <ActionButton variant="gray" disabled={loading} onClick={() => submitStatus('no_show')}>
                      No Show
                    </ActionButton>
                    <ActionButton variant="danger" disabled={loading} onClick={() => { setCancelMode(true); setError('') }}>
                      Cancel
                    </ActionButton>
                  </div>
                )}

                {/* ongoing */}
                {appointment.status === 'ongoing' && (
                  <ActionButton variant="success" disabled={loading} onClick={() => submitStatus('completed')}>
                    ✓ Mark Complete
                  </ActionButton>
                )}

                {/* Cancel reason form */}
                {cancelMode && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-semibold text-red-700 mb-2">Cancellation Reason</p>
                    <textarea
                      value={cancelReason}
                      onChange={e => { setCancelReason(e.target.value); setError('') }}
                      placeholder="Please provide a reason (required)"
                      rows={3}
                      className="w-full border border-red-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <ActionButton variant="danger" disabled={loading || !cancelReason.trim()} onClick={submitCancel}>
                        {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                      </ActionButton>
                      <ActionButton variant="gray" disabled={loading} onClick={() => { setCancelMode(false); setCancelReason(''); setError('') }}>
                        Never mind
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Status log timeline ── */}
            {appointment.status_logs?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Status History</p>
                <div className="space-y-2">
                  {appointment.status_logs.map(log => (
                    <div key={log.id} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                      <div className="min-w-0">
                        <p className="text-gray-700">
                          <span className="font-medium capitalize">{log.from_status?.replace('_', ' ')}</span>
                          {' → '}
                          <span className="font-medium capitalize">{log.to_status?.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          by {log.changed_by?.name} · {new Date(log.created_at).toLocaleString('en-PH', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </p>
                        {log.reason && (
                          <p className="text-xs text-gray-500 italic mt-0.5">"{log.reason}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}