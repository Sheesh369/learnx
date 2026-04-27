interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  className?: string
}

export function Select({ label, value, onChange, options, placeholder, fullWidth, className = '' }: SelectProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="text-sm font-medium text-neutral-700 mb-1.5 block">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 transition-colors hover:border-neutral-300 ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
