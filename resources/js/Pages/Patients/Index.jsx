import { useState, useCallback } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import PatientModal from '@/Components/Patients/PatientModal'
import debounce from 'lodash/debounce'
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
          className={`
            px-3 py-1.5 text-xs rounded-md transition-colors
            ${!link.url ? 'text-gray-300 cursor-not-allowed pointer-events-none' : ''}
            ${link.active
              ? 'bg-blue-600 text-white font-medium'
              : link.url ? 'text-gray-600 hover:bg-gray-100' : ''}
          `}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </div>
  )
}

export default function PatientsIndex() {
  const { patients, filters, flash, auth } = usePage().props
  const user = auth.user

  const [modalOpen, setModalOpen]         = useState(false)
  const [search, setSearch]               = useState(filters?.search ?? '')
  const [statusFilter, setStatusFilter]   = useState(filters?.status ?? 'active')
  const [flashDismissed, setFlashDismissed] = useState(false)

  const doSearch = useCallback(
    debounce((value, status) => {
      router.get(
        '/patients',
        { search: value, status },
        { preserveState: true, replace: true }
      )
    }, 350),
    []
  )

  const handleSearch = (value) => {
    setSearch(value)
    doSearch(value, statusFilter)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    router.get('/patients', { search, status: value }, { preserveState: true, replace: true })
  }

  const handleToggleStatus = (patient) => {
    const action = patient.is_active ? 'archive' : 'restore'
    if (!window.confirm(`${action === 'archive' ? 'Archive' : 'Restore'} ${patient.full_name}?`)) return
    router.patch(`/patients/${patient.id}/toggle-status`)
  }

  const handleDelete = (patient) => {
    if (!window.confirm(`Permanently delete ${patient.full_name}? This cannot be undone.`)) return
    router.delete(`/patients/${patient.id}`)
  }

  return (
    <AppLayout title="Patients">
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
          <h1 className="text-xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {patients.total} patient{patients.total !== 1 ? 's' : ''} found
          </p>
        </div>
        {['admin', 'receptionist'].includes(user.role) && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, ID, or mobile..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        >
          <option value="all">All Patients</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Patient ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Full Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden sm:table-cell">Age</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden md:table-cell">Gender</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden md:table-cell">Contact</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden lg:table-cell">Last Visit</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-400 text-sm">No patients found.</p>
                  </td>
                </tr>
              ) : (
                patients.data.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {patient.patient_code}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {patient.full_name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">
                      {patient.age}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap hidden md:table-cell font-mono text-xs">
                      {patient.display_mobile}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                      {patient.last_visit ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {patient.is_active ? (
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">Active</span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Archived</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <Link
                          href={`/patients/${patient.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View profile"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>

                        {/* Edit */}
                        {['admin', 'receptionist'].includes(user.role) && (
                          <Link
                            href={`/patients/${patient.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit patient"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        )}

                        {/* Archive/Restore */}
                        {['admin', 'receptionist'].includes(user.role) && (
                          <button
                            onClick={() => handleToggleStatus(patient)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title={patient.is_active ? 'Archive patient' : 'Restore patient'}
                          >
                            {patient.is_active ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            )}
                          </button>
                        )}

                        {/* Delete */}
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(patient)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete patient"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination links={patients.links} />
      </div>

      {/* Add Patient Modal */}
      {modalOpen && <PatientModal onClose={() => setModalOpen(false)} />}
    </AppLayout>
  )
}