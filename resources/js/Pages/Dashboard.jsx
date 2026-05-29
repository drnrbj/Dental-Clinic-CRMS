import { usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import StatCard from '@/Components/StatCard'
import StatusBadge from '@/Components/StatusBadge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function Dashboard() {
  const { stats, weeklyData, recentAppointments, todaySchedule } = usePage().props

  return (
    <AppLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Weekly Appointments Chart */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Weekly Appointments</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={28}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              cursor={{ fill: '#eff6ff' }}
            />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Appointments" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column: Recent Appointments + Today's Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Appointments (65%) */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Patient</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Dentist</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Date & Time</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAppointments.map((appt, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">{appt.patient}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{appt.dentist}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden md:table-cell">{appt.datetime}</td>
                    <td className="px-4 py-3.5 text-gray-600 hidden lg:table-cell">{appt.type}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Schedule (35%) */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="p-4 space-y-2">
            {todaySchedule.map((slot, i) => (
              <div
                key={i}
                className={`
                  px-4 py-3 rounded-lg border transition-colors
                  ${slot.current
                    ? 'border-l-4 border-l-blue-600 border-blue-100 bg-blue-50/40'
                    : 'border-gray-100 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{slot.time}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{slot.patient}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{slot.procedure}</p>
                  </div>
                  {slot.current && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Now
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}