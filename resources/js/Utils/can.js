/**
 * Client-side permission gate helper.
 *
 * This mirrors the server-side RBAC rules defined in RoleMiddleware and
 * TreatmentPolicy. It is used to conditionally render UI elements in React —
 * it does NOT replace server-side authorization. The server always enforces
 * the real rules; this is purely a UX helper to avoid rendering buttons
 * that would 403 when clicked.
 *
 * Usage:
 *   import { can } from '@/Utils/can'
 *   const user = usePage().props.auth.user
 *   {can(user, 'patients.delete') && <button ...>Delete</button>}
 */

/** @type {Record<string, string[]>} */
const RULES = {
  // Patients
  'patients.create':        ['admin', 'receptionist'],
  'patients.edit':          ['admin', 'receptionist'],
  'patients.archive':       ['admin', 'receptionist'],
  'patients.delete':        ['admin'],

  // Appointments
  'appointments.create':    ['admin', 'receptionist'],
  'appointments.edit':      ['admin', 'receptionist'],
  'appointments.delete':    ['admin', 'receptionist'],
  'appointments.updateStatus': ['admin', 'receptionist', 'dentist'],
  'appointments.start':     ['admin', 'dentist'], // Start Treatment button

  // Treatments
  'treatments.create':      ['admin', 'dentist'],
  'treatments.edit':        ['admin'],
  'treatments.view':        ['admin', 'receptionist', 'dentist'],

  // Billing
  'billing.view':           ['admin', 'receptionist'],
  'billing.manage':         ['admin', 'receptionist'],
  'billing.createInvoice':  ['admin', 'receptionist'],
  'billing.recordPayment':  ['admin', 'receptionist'],

  // Admin-only
  'admin.only':             ['admin'],
}

/**
 * Check whether a user has permission for a given action.
 *
 * @param {Object|null} user   The auth user object from usePage().props.auth.user
 * @param {string}      action A key from the RULES map above
 * @returns {boolean}
 */
export function can(user, action) {
  if (!user) return false
  return RULES[action]?.includes(user.role) ?? false
}

/**
 * Check whether the user has ANY of the provided roles.
 * Useful for coarse-grained conditional rendering.
 *
 * @param {Object|null} user
 * @param  {...string}  roles
 * @returns {boolean}
 *
 * Example: hasRole(user, 'admin', 'receptionist')
 */
export function hasRole(user, ...roles) {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Convenience booleans — avoids repetitive can() calls in JSX.
 *
 * @param {Object|null} user
 * @returns {{ isAdmin: boolean, isReceptionist: boolean, isDentist: boolean }}
 */
export function useRoles(user) {
  return {
    isAdmin:        user?.role === 'admin',
    isReceptionist: user?.role === 'receptionist',
    isDentist:      user?.role === 'dentist',
  }
}