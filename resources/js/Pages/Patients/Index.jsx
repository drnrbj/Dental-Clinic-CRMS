import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import PatientModal from '@/Components/Patients/PatientModal'

const HARDCODED_PATIENTS = [
  {
    id: 'PAT-2024-0001',
    name: 'Maria Santos',
    age: 34,
    gender: 'Female',
    contact: '0917-234-5678',
    lastVisit: 'Dec 10, 2024',
    status: 'Active',
  },
  {
    id: 'PAT-2024-0002',
    name: 'Juan dela Cruz',
    age: 45,
    gender: 'Male',
    contact: '0918-345-6789',
    lastVisit: 'Nov 22, 2024',
    status: 'Active',
  },
  {
    id: 'PAT-2024-0003',
    name: 'Rosario Bautista',
    age: 27,
    gender: 'Female',
    contact: '0919-456-7890',
    lastVisit: 'Jan 5, 2025',
    status: 'Active',
  },
  {
    id: 'PAT-2024-0004',
    name: 'Eduardo Ramos',
    age: 52,
    gender: 'Male',
    contact: '0920-567-8901',
    lastVisit: 'Oct 14, 2024',
    status: 'Active',
  },
  {
    id: 'PAT-2024-0005',
    name: 'Ligaya Villanueva',
    age: 39,
    gender: 'Female',
    contact: '0921-678-9012',
    lastVisit: 'Sep 30, 2024',
    status: 'Archived',
  },
  {
    id: 'PAT-2024-0006',
    name: 'Carlos Mendoza',
    age: 61,
    gender: 'Male',
    contact: '0922-789-0123',
    lastVisit: 'Jan 12, 2025',
    status: 'Active',
  },
  {
    id: 'PAT-2024-0007',
    name: 'Analiza Reyes',
    age: 29,
    gender: 'Female',
    contact: '0923-890-1234',
    lastVisit: 'Dec 28, 2024',
    status: 'Active',
  },
  {
    id: 'PAT-2024-0008',
    name: 'Roberto Flores',
    age: 44,
    gender: 'Male',
    contact: '0924-901-2345',
    lastVisit: 'Nov 8, 2024',
    status: 'Active',
  },
]

export default function PatientsIndex() {
  const { flash } = usePage().props
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [flashDismissed, setFlashDismissed] = useState(false)

  const filtered = HARDCODED_PATIENTS.filter(p => {
    const matchSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === 'all' ||
      p.status.toLowerCase() === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <AppLayout title="Patients">
      {/* Flash success */}
      {!flashDismissed && flash?.success && (
        <div className="flex items-center justify-between bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-4">
          <span className="text-sm">{flash.success}</span>
          <button
            onClick={() => setFlashDismissed(true)}
            className="text-green-500 hover:text-green-700 ml-3"
          >
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
          <p className="text-sm text-gray-500 mt-0.5">{HARDCODED_PATIENTS.length} total patients</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Patient
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or patient ID..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
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
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">
                  Patient ID
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  Full Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                  Age
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  Gender
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                  Last Visit
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No patients found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {patient.id}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">
                      {patient.age}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap hidden md:table-cell">
                      {patient.contact}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                      {patient.lastVisit}
                    </td>
                    <td className="px-4 py-3.5">
                      {patient.status === 'Active' ? (
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View patient"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/patients/${patient.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit patient"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {HARDCODED_PATIENTS.length} patients
            </p>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {modalOpen && (
        <PatientModal onClose={() => setModalOpen(false)} />
      )}
    </AppLayout>
  )
}