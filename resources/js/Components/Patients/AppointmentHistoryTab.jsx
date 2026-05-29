import StatusBadge from '@/Components/StatusBadge'

export default function AppointmentHistoryTab({ appointments }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">No appointments yet</p>
        <p className="text-gray-300 text-xs mt-1">Appointments will appear here once scheduled.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Date</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Time</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Dentist</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Type</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {appointments.map(appt => (
            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4 text-gray-800 whitespace-nowrap">{appt.appointment_date ?? '—'}</td>
              <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{appt.appointment_time ?? '—'}</td>
              <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{appt.dentist_name ?? '—'}</td>
              <td className="py-3 pr-4 text-gray-600">{appt.type}</td>
              <td className="py-3">
                <StatusBadge status={appt.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}