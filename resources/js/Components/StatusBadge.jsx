const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-700',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700',
  },
  no_show: {
    label: 'No Show',
    className: 'bg-gray-100 text-gray-600',
  },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  }

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}