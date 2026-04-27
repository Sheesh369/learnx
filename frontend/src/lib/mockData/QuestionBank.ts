import type { QuestionType, Difficulty } from '@/types'

interface MockQuestion {
  id: string; text: string; type: QuestionType; difficulty: Difficulty
  marks: number; classId: number; subject: string; chapter: string
  options?: string[]; correctAnswer: string; explanation?: string; timeToSolve: string
}

export const MOCK_QUESTIONS: MockQuestion[] = [
  { id: 'q1', text: 'What is the value of √144?', type: 'mcq', difficulty: 'easy', marks: 1, classId: 9, subject: 'Mathematics', chapter: 'Number Systems', options: ['10', '12', '14', '16'], correctAnswer: '12', explanation: '√144 = 12 because 12 × 12 = 144', timeToSolve: '00:01:00' },
  { id: 'q2', text: 'Which organelle is known as the powerhouse of the cell?', type: 'mcq', difficulty: 'easy', marks: 1, classId: 8, subject: 'Science', chapter: 'Cell Structure', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'], correctAnswer: 'Mitochondria', explanation: 'Mitochondria produces ATP, the energy currency of the cell.', timeToSolve: '00:01:30' },
  { id: 'q3', text: 'Define a polynomial with an example.', type: 'short_answer', difficulty: 'medium', marks: 2, classId: 9, subject: 'Mathematics', chapter: 'Polynomials', correctAnswer: 'A polynomial is an expression of variables and coefficients. Example: 3x² + 2x + 1', timeToSolve: '00:03:00' },
  { id: 'q4', text: 'The Earth is the third planet from the Sun.', type: 'true_false', difficulty: 'easy', marks: 1, classId: 6, subject: 'Science', chapter: 'Solar System', correctAnswer: 'True', timeToSolve: '00:00:30' },
  { id: 'q5', text: 'Explain the process of photosynthesis in detail. Include the chemical equation and the role of chlorophyll.', type: 'long_answer', difficulty: 'hard', marks: 5, classId: 10, subject: 'Science', chapter: 'Plant Biology', correctAnswer: 'Photosynthesis is the process by which green plants convert sunlight, CO₂, and water into glucose and oxygen. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', timeToSolve: '00:10:00' },
  { id: 'q6', text: 'The chemical formula of water is _____.', type: 'fill_blank', difficulty: 'easy', marks: 1, classId: 7, subject: 'Science', chapter: 'Atoms & Molecules', correctAnswer: 'H₂O', timeToSolve: '00:00:30' },
  { id: 'q7', text: 'Who wrote the national anthem of India?', type: 'short_answer', difficulty: 'easy', marks: 1, classId: 5, subject: 'Social Science', chapter: 'Indian National Movement', correctAnswer: 'Rabindranath Tagore', timeToSolve: '00:01:00' },
  { id: 'q8', text: 'Solve: If 2x + 3 = 11, find the value of x.', type: 'short_answer', difficulty: 'medium', marks: 2, classId: 8, subject: 'Mathematics', chapter: 'Linear Equations', correctAnswer: 'x = 4', explanation: '2x = 11 - 3 = 8, so x = 4', timeToSolve: '00:02:00' },
  { id: 'q9', text: 'The process of converting a solid directly into gas is called _____.', type: 'fill_blank', difficulty: 'medium', marks: 1, classId: 9, subject: 'Science', chapter: 'Matter', correctAnswer: 'Sublimation', timeToSolve: '00:01:00' },
  { id: 'q10', text: 'Describe the French Revolution and its impact on the world.', type: 'long_answer', difficulty: 'hard', marks: 5, classId: 10, subject: 'Social Science', chapter: 'French Revolution', correctAnswer: 'The French Revolution (1789) overthrew the monarchy and established a republic...', timeToSolve: '00:12:00' },
  { id: 'q11', text: 'What is the SI unit of force?', type: 'mcq', difficulty: 'easy', marks: 1, classId: 9, subject: 'Science', chapter: 'Force and Motion', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton', timeToSolve: '00:00:45' },
  { id: 'q12', text: 'All prime numbers are odd numbers.', type: 'true_false', difficulty: 'medium', marks: 1, classId: 6, subject: 'Mathematics', chapter: 'Number Systems', correctAnswer: 'False', explanation: '2 is a prime number and it is even.', timeToSolve: '00:01:00' },
]
