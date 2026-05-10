import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { api, type QuestionOut, type QuestionCreate } from '@/services/api'

interface Props {
  mode: 'add' | 'edit'
  chapterId: string
  initial?: QuestionOut
  onSave: (q: QuestionOut) => void
  onClose: () => void
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const

type FormState = {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D' | ''
  difficulty: 'easy' | 'medium' | 'hard' | ''
}

export default function QuestionModal({ mode, chapterId, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    question_text: initial?.question_text ?? '',
    option_a: initial?.option_a ?? '',
    option_b: initial?.option_b ?? '',
    option_c: initial?.option_c ?? '',
    option_d: initial?.option_d ?? '',
    correct_option: initial?.correct_option ?? '',
    difficulty: initial?.difficulty ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'submit', string>>>({})
  const [saving, setSaving] = useState(false)

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    if (form.question_text.trim().length < 10) errs.question_text = 'Must be at least 10 characters'
    if (!form.option_a.trim()) errs.option_a = 'Required'
    if (!form.option_b.trim()) errs.option_b = 'Required'
    if (!form.option_c.trim()) errs.option_c = 'Required'
    if (!form.option_d.trim()) errs.option_d = 'Required'
    if (!form.correct_option) errs.correct_option = 'Select the correct answer'
    if (!form.difficulty) errs.difficulty = 'Select a difficulty'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      const payload: QuestionCreate = {
        question_text: form.question_text.trim(),
        option_a: form.option_a.trim(),
        option_b: form.option_b.trim(),
        option_c: form.option_c.trim(),
        option_d: form.option_d.trim(),
        correct_option: form.correct_option as 'A' | 'B' | 'C' | 'D',
        difficulty: form.difficulty as 'easy' | 'medium' | 'hard',
        chapter_id: chapterId,
      }
      let result: QuestionOut
      if (mode === 'add') {
        result = await api.questions.create(payload)
      } else {
        result = await api.questions.update(initial!.id, payload)
      }
      onSave(result)
    } catch (e) {
      setErrors({ submit: e instanceof Error ? e.message : 'Failed to save question' })
      setSaving(false)
    }
  }

  const optionValues: Record<string, string> = {
    A: form.option_a,
    B: form.option_b,
    C: form.option_c,
    D: form.option_d,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!saving ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-display text-lg font-bold text-neutral-900">
            {mode === 'add' ? 'Add Question' : 'Edit Question'}
          </h2>
          <button onClick={!saving ? onClose : undefined} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {errors.submit && (
            <div className="px-4 py-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-xl">
              {errors.submit}
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-neutral-700">Question Text</label>
            <textarea
              rows={4}
              value={form.question_text}
              onChange={e => set('question_text', e.target.value)}
              placeholder="Enter the question..."
              className={`w-full px-3 py-2.5 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                errors.question_text ? 'border-danger-400' : 'border-neutral-200'
              }`}
            />
            {errors.question_text && (
              <p className="text-xs text-danger-600">{errors.question_text}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-neutral-700">Options</label>
            {OPTIONS.map((letter, idx) => {
              const key = OPTION_KEYS[idx]
              return (
                <div key={letter} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={`Option ${letter}`}
                    className={`flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                      errors[key] ? 'border-danger-400' : 'border-neutral-200'
                    }`}
                  />
                  {errors[key] && <p className="text-xs text-danger-600 shrink-0">{errors[key]}</p>}
                </div>
              )
            })}
          </div>

          {/* Correct Answer — shows live option text */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">Correct Answer</label>
            {errors.correct_option && (
              <p className="text-xs text-danger-600">{errors.correct_option}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {OPTIONS.map(letter => (
                <label
                  key={letter}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.correct_option === letter
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="correct_option"
                    value={letter}
                    checked={form.correct_option === letter}
                    onChange={() => set('correct_option', letter)}
                    className="mt-0.5 accent-primary-600"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-neutral-700">{letter}</span>
                    {optionValues[letter] && (
                      <span className="text-neutral-500 ml-1 text-xs">— {optionValues[letter]}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-neutral-700">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={e => set('difficulty', e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white ${
                errors.difficulty ? 'border-danger-400' : 'border-neutral-200'
              }`}
            >
              <option value="">Select difficulty...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty && <p className="text-xs text-danger-600">{errors.difficulty}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Question
          </button>
        </div>
      </div>
    </div>
  )
}
