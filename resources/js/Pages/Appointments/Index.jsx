import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import AppointmentModal from '@/Components/Appointments/AppointmentModal'
import StatusBadge from '@/Components/StatusBadge'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Current month: May 2026
const HARDCODED_EVENTS = [
  { title: 'Maria Santos – Cleaning',         date: '2026-05-05', color: '#2563eb' },
  { title: 'Juan dela Cruz – Extraction',     date: '2026-05-07', color: '#16a34a' },
  { title: 'Rosario Bautista – Braces',       date: '2026-05-09', color: '#ca8a04' },
  { title: 'Eduardo Ramos – Root Canal',      date: '2026-05-12', color: '#2563eb' },
  { title: 'Carina Mendoza – Whitening',      date: '2026-05-14', color: '#16a34a' },
  { title: 'Roberto Flores – Check-up',       date: '2026-05-16', color: '#2563eb' },
  { title: 'Analiza Reyes – Filling',         date: '2026-05-19', color: '#ca8a04' },
  { title: 'Carlos Mendoza – Consultation',   date: '2026-05-21', color: '#2563eb' },
  { title: 'Ligaya Villanueva – Cleaning',    date: '2026-05-26', color: '#16a34a' },
  { title: 'Maria Santos – Follow-up',        date: '2026-05-29', color: '#2563eb' },
]

const TODAY_SCHEDULE = [
  { time: '09:00 AM', patient: 'Maria Santos',    procedure: 'Follow-up Consultation', dentist: 'Dr. Ana Reyes',     status: 'confirmed' },
  { time: '10:30 AM', patient: 'Roberto Flores',  procedure: 'Dental Cleaning',        dentist: 'Dr. Marco Santos',  status: 'completed' },
  { time: '11:00 AM', patient: 'Carina Mendoza',  procedure: 'Tooth Whitening',        dentist: 'Dr. Ana Reyes',     status: 'confirmed' },
  { time: '01:00 PM', patient: 'Eduardo Ramos',   procedure: 'Root Canal Session 2',   dentist: 'Dr. Liza Torres',   status: 'pending' },
  { time: '03:00 PM', patient: 'Analiza Reyes',   procedure: 'Tooth Filling',          dentist: 'Dr. Marco Santos',  status: 'confirmed' },
]

export default function AppointmentsIndex() {
  const { flash } = usePage().props
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [flashDismissed, setFlashDismissed] = useState(false)

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr)
    setModalOpen(true)
  }

  const handleEventClick = (info) => {
    setSelectedEvent({
      title: info.event.title,
      date:  info.event.startStr,
      color: info.event.backgroundColor,
    })
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
          <p className="text-sm text-gray-500 mt-0.5">Click a date to schedule a new appointment</p>
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

      {/* Event detail banner */}
      {selectedEvent && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedEvent.color }} />
            <span className="text-sm font-medium text-blue-800">{selectedEvent.title}</span>
            <span className="text-xs text-blue-500">{selectedEvent.date}</span>
          </div>
          <button onClick={() => setSelectedEvent(null)} className="text-blue-400 hover:text-blue-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Calendar (65%) */}
        <div className="lg:w-2/3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 fullcalendar-wrap">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left:   'prev,next today',
                center: 'title',
                right:  'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height="auto"
              events={HARDCODED_EVENTS}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDisplay="block"
              dayMaxEvents={3}
              eventBorderColor="transparent"
              eventTextColor="#ffffff"
            />
          </div>
        </div>

        {/* Today's schedule (35%) */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Today's Schedule</h2>
              <p className="text-xs text-gray-500 mt-0.5">May 29, 2026</p>
            </div>
            <div className="divide-y divide-gray-50">
              {TODAY_SCHEDULE.map((appt, i) => (
                <div key={i} className="px-4 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900">{appt.time}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{appt.patient}</p>
                  <p className="text-xs text-gray-500">{appt.procedure}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{appt.dentist}</p>
                  <button className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {modalOpen && (
        <AppointmentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultDate={selectedDate}
        />
      )}
    </AppLayout>
  )
}