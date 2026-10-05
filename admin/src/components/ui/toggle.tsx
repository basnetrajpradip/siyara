const Toggle = ({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) => {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
        (checked ? "bg-primary" : "bg-input")
      }
    >
      <span
        className={
          "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out " +
          (checked ? "translate-x-5" : "translate-x-0")
        }
      />
    </button>
  )
}

export default Toggle
