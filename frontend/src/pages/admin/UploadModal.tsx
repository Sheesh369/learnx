import { Upload } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

type UploadType = 'pdf' | 'video' | 'image' | 'gif'

interface UploadModalProps {
  type: UploadType | null
  onClose: () => void
  classId: string
  subjectName: string
  chapterId: string
  chapterTitle: string
}

export default function UploadModal({ type, onClose, classId, subjectName, chapterId, chapterTitle }: UploadModalProps) {
  if (!type) return null

  const titles: Record<UploadType, string> = { pdf: 'Upload PDF', video: 'Add Video', image: 'Upload Image', gif: 'Upload GIF' }

  return (
    <Modal open={!!type} onClose={onClose} title={titles[type]} maxWidth="md">
      <div className="space-y-4">
        <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
          <p className="text-xs text-primary-600 font-medium">Uploading to:</p>
          <p className="text-sm font-semibold text-primary-800">Class {classId} → {subjectName} → Ch {chapterId}: {chapterTitle}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
          <input type="text" placeholder="Enter title..." className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm" />
        </div>
        {type === 'video' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Source Type</label>
              <select className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm">
                <option>YouTube / External URL</option><option>File Upload</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Video URL</label>
              <input type="url" placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm" />
            </div>
          </>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-600 font-medium">Drag & drop or click to upload</p>
            <p className="text-xs text-neutral-400 mt-1">
              {type === 'pdf' ? 'PDF up to 50MB' : type === 'image' ? 'PNG, JPG up to 10MB' : 'GIF up to 20MB'}
            </p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={<Upload className="w-4 h-4" />}>Upload</Button>
        </div>
      </div>
    </Modal>
  )
}
