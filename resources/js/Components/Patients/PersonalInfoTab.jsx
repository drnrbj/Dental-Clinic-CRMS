import { Link } from '@inertiajs/react'

function InfoGroup({ title, children, editHref, canEdit }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        {canEdit && editHref && (
          <Link href={editHref} className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
            Edit
          </Link>
        )}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {children}
      </dl>
    </div>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-800">{value || '—'}</dd>
    </div>
  )
}

export default function PersonalInfoTab({ patient, user }) {
  const canEdit = ['admin', 'receptionist'].includes(user?.role)
  const editHref = `/patients/${patient.id}/edit`

  return (
    <div>
      {/* Personal Details */}
      <InfoGroup title="Personal Details" editHref={editHref} canEdit={canEdit}>
        <InfoField label="First Name"    value={patient.first_name} />
        <InfoField label="Last Name"     value={patient.last_name} />
        <InfoField label="Middle Name"   value={patient.middle_name} />
        <InfoField label="Birthdate"     value={patient.birthdate_display} />
        <InfoField label="Age"           value={patient.age ? `${patient.age} years old` : null} />
        <InfoField label="Gender"        value={patient.gender_display} />
        <InfoField label="Civil Status"  value={patient.civil_status_display} />
      </InfoGroup>

      <div className="border-t border-gray-100 my-4" />

      {/* Contact Info */}
      <InfoGroup title="Contact Information" editHref={editHref} canEdit={canEdit}>
        <InfoField label="Mobile Number" value={patient.display_mobile} />
        <InfoField label="Email Address" value={patient.email} />
        <div className="sm:col-span-2">
          <InfoField label="Address" value={patient.address} />
        </div>
      </InfoGroup>

      <div className="border-t border-gray-100 my-4" />

      {/* Emergency Contact */}
      <InfoGroup title="Emergency Contact" editHref={editHref} canEdit={canEdit}>
        <InfoField label="Name"         value={patient.emergency_contact_name} />
        <InfoField label="Relationship" value={patient.emergency_contact_relationship} />
        <InfoField label="Contact No."  value={patient.emergency_contact_number} />
      </InfoGroup>

      <div className="border-t border-gray-100 my-4" />

      {/* Medical Info */}
      <InfoGroup title="Medical Information" editHref={editHref} canEdit={canEdit}>
        <div className="sm:col-span-2">
          <InfoField label="Known Allergies"         value={patient.allergies} />
        </div>
        <div className="sm:col-span-2">
          <InfoField label="Medical Conditions"      value={patient.medical_conditions} />
        </div>
        <div className="sm:col-span-2">
          <InfoField label="Current Medications"     value={patient.current_medications} />
        </div>
        <div className="sm:col-span-2">
          <InfoField label="Notes for Dentist"       value={patient.dentist_notes} />
        </div>
      </InfoGroup>
    </div>
  )
}