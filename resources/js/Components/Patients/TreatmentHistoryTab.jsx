export default function TreatmentHistoryTab({ treatments }) {
  if (!treatments || treatments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">No treatments recorded</p>
        <p className="text-gray-300 text-xs mt-1">Treatments will appear here after they are recorded.</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-6">
        {treatments.map((treatment, i) => (
          <li key={treatment.id} className="relative pb-6">
            {/* Vertical connector line */}
            {i < treatments.length - 1 && (
              <span
                className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-100"
                aria-hidden="true"
              />
            )}

            <div className="relative flex gap-4">
              {/* Date circle */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 bg-gray-50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{treatment.procedure}</p>
                    {treatment.dentist_name && (
                      <p className="text-xs text-gray-500 mt-0.5">{treatment.dentist_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {treatment.cost !== null && treatment.cost !== undefined && (
                      <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                        ₱{Number(treatment.cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {treatment.treatment_date ?? '—'}
                    </span>
                  </div>
                </div>

                {treatment.diagnosis && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-gray-500">Diagnosis: </span>
                    {treatment.diagnosis}
                  </p>
                )}
                {treatment.notes && (
                  <p className="text-xs text-gray-500 italic">{treatment.notes}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}