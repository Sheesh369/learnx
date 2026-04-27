import { ReactNode } from 'react'

interface InputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: ReactNode
  type?: string
  fullWidth?: boolean
  className?: string
}

export function Input({ label, value, onChange, placeholder, icon, type = 'text', fullWidth, className = '' }: InputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && <label className="text-sm font-medium text-neutral-700 mb-1.5 block">{label}</label>}
      <div className={`flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl transition-colors focus-within:border-primary-300 ${fullWidth ? 'w-full' : ''} ${className}`}>
        {icon && <span className="text-neutral-400 shrink-0">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 w-full"
        />
      </div>
    </div>
  )
}
