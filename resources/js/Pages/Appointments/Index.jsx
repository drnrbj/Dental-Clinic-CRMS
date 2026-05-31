import { useState, useRef } from 'react'
import { usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import AppointmentModal from '@/Components/Appointments/AppointmentModal'
import AppointmentDetailPanel from '@/Components/Appointments/AppointmentDetailPanel'
import StatusBadge from '@/Components/StatusBadge'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

export default function AppointmentsIndex() {
  const { todayAppointments, dentists, flash, auth } = usePage().props

  const calendarRef = useRef(null)

  const [modalOpen, setModalOpen]                   = useState(false)
  const [selectedDate, setSelectedDate]             = useState('')
  const [detailOpen, setDetailOpen]                 = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [flashDismissed, setFlashDismissed]         = useState(false)

  // ── Load appointment detail from API ────────────────────────────────────────
  const openDetail = (id) => {
    fetch(`/appointments/${id}`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(r => r.json())
      .then(data => {
        setSelectedAppointment(data)
        setDetailOpen(true)
      })
  }

  // ── After a status change: refetch calendar events + close panel ─────────
  const handleStatusChange = () => {
    calendarRef.current?.getApi().refetchEvents()
    setDetailOpen(false)
    setSelectedAppointment(null)
  }

  // ── FullCalendar events feed from API ────────────────────────────────────
  const fetchEvents = (info, successCallback, failureCallback) => {
    fetch(
      `/appointments?start=${info.startStr}&end=${info.endStr}`,
      { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }
    )
      .then(r => r.json())
      .then(data => successCallback(data))
      .catch(failureCallback)
  }

  return (
    <AppLayout title="Appointments">
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

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Click a date or event to manage appointments</p>
        </div>
        <button
          onClick={() => { setSelectedDate(''); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Appointment
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {[
          { label: 'Pending',   color: '#ca8a04' },
          { label: 'Confirmed', color: '#2563eb' },
          { label: 'Ongoing',   color: '#7c3aed' },
          { label: 'Completed', color: '#16a34a' },
          { label: 'Cancelled', color: '#dc2626' },
          { label: 'No Show',   color: '#6b7280' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Calendar */}
        <div className="lg:w-2/3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 fullcalendar-wrap">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left:   'prev,next today',
                center: 'title',
                right:  'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height="auto"
              events={fetchEvents}
              dateClick={(info) => {
                setSelectedDate(info.dateStr)
                setModalOpen(true)
              }}
              eventClick={(info) => {
                const id = info.event.extendedProps?.id
                if (id) openDetail(id)
              }}
              eventDisplay="block"
              dayMaxEvents={3}
              eventBorderColor="transparent"
              eventTextColor="#ffffff"
            />
          </div>
        </div>

        {/* Today's schedule */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Today's Schedule</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {todayAppointments?.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <svg className="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-sm">No appointments today</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayAppointments?.map(appt => (
                  <button
                    key={appt.id}
                    onClick={() => openDetail(appt.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-900">{appt.time}</span>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{appt.patient_name}</p>
                    <p className="text-xs text-gray-500">{appt.type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{appt.dentist_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {modalOpen && (
        <AppointmentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultDate={selectedDate}
          dentists={dentists}
          onSuccess={() => {
            calendarRef.current?.getApi().refetchEvents()
            setModalOpen(false)
          }}
        />
      )}

      {/* Detail slide-in panel */}
      <AppointmentDetailPanel
        appointment={selectedAppointment}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedAppointment(null) }}
        onStatusChange={handleStatusChange}
        auth={auth}
      />
    </AppLayout>
  )
}