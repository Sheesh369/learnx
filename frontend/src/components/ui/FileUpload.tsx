import { useRef } from 'react'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  accept?: string
  label?: string
  description?: string
  onFileSelect: (file: File) => void
  maxSizeLabel?: string
  className?: string
}

export function FileUpload({ accept = '.pdf', label = 'Upload File', description, onFileSelect, maxSizeLabel = 'up to 100MB', className = '' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <div
        onClick={handleClick}
        className={`flex flex-col items-center justify-center py-10 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group ${className}`}
      >
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6 text-primary-500" />
        </div>
        <p className="text-base font-semibold text-neutral-900 mb-1">{label}</p>
        {description && <p className="text-sm text-neutral-500 mb-1">{description}</p>}
        <p className="text-xs text-neutral-400 mb-4">{accept.replace(/\./g, '').toUpperCase()} {maxSizeLabel}</p>
        <span className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">Choose File</span>
      </div>
    </>
  )
}
