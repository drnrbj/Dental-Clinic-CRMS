/**
 * Spinner — inline SVG spinner for use inside submit buttons.
 *
 * Usage:
 *   import Spinner from '@/Components/Spinner'
 *
 *   <button type="submit" disabled={form.processing}>
 *     {form.processing ? (
 *       <span className="flex items-center gap-2">
 *         <Spinner /> Saving...
 *       </span>
 *     ) : 'Save'}
 *   </button>
 */
export default function Spinner({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

/**
 * SubmitButton — full submit button with built-in processing state.
 * Wraps Spinner automatically. Disables itself while form.processing is true.
 *
 * Props:
 *   processing  boolean   form.processing from Inertia useForm
 *   label       string    Default button label, e.g. "Save Patient"
 *   loadingLabel string?  Label while loading, defaults to "Saving..."
 *   className   string?   Additional Tailwind classes
 *   ...rest               Passed to <button>
 *
 * Usage:
 *   import { SubmitButton } from '@/Components/Spinner'
 *   <SubmitButton processing={form.processing} label="Save Patient" />
 */
export function SubmitButton({
  processing,
  label,
  loadingLabel = 'Saving...',
  className = '',
  ...rest
}) {
  return (
    <button
      type="submit"
      disabled={processing}
      className={`
        flex items-center gap-2 px-5 py-2 text-sm font-medium
        bg-blue-600 hover:bg-blue-700
        disabled:opacity-60 disabled:cursor-not-allowed
        text-white rounded-lg transition-colors
        ${className}
      `}
      {...rest}
    >
      {processing ? (
        <>
          <Spinner />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  )
}