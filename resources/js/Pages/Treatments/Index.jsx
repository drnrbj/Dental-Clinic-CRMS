import { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

function Pagination({ links }) {
  if (!links || links.length <= 3) return null
  return (
    <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-gray-100">
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

export default function TreatmentsIndex() {
  const { treatments, filters, flash } = usePage().props
  const [flashDismissed, setFlashDismissed] = useState(false)
  const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '')
  const [dateTo, setDateTo]     = useState(filters?.date_to ?? '')

  const applyFilters = () => {
    router.get('/treatments', { date_from: dateFrom, date_to: dateTo }, { preserveState: true, replace: true })
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    router.get('/treatments', {}, { preserveState: true, replace: true })
  }

  return (
    <AppLayout title="Treatments">
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

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Treatments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{treatments.total} total records</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <button onClick={applyFilters}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Apply
        </button>
        {(filters?.date_from || filters?.date_to) && (
          <button onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Clear
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Patient</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden md:table-cell">Dentist</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden lg:table-cell">Procedure</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden xl:table-cell">Diagnosis</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Cost</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {treatments.data.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No treatment records found.</td></tr>
              ) : (
                treatments.data.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      <Link href={`/patients/${t.patient_id}`} className="hover:text-blue-600 transition-colors">{t.patient_name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap hidden md:table-cell">{t.dentist_name}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.procedure_display}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden xl:table-cell max-w-xs"><p className="truncate">{t.diagnosis}</p></td>
                    <td className="px-4 py-3.5 text-right font-semibold text-blue-600 whitespace-nowrap">{t.cost_display}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/treatments/${t.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination links={treatments.links} />
      </div>
    </AppLayout>
  )
}