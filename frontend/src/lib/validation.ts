import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'teacher', 'student', 'parent'], { required_error: 'Please select a role' }),
  class_name: z.string().optional(),
  section: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

/** Validate a form against a Zod schema, returns field-level errors or null */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): Record<string, string> | null {
  const result = schema.safeParse(data)
  if (result.success) return null
  const errors: Record<string, string> = {}
  result.error.errors.forEach(e => {
    if (e.path[0]) errors[String(e.path[0])] = e.message
  })
  return errors
}
