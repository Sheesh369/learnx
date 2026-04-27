export const PARENT_DASHBOARD_RESULTS = [
  { subject: 'Mathematics', test: 'Ch 4: Linear Equations', score: 85, avg: 72, date: 'Apr 18' },
  { subject: 'Science', test: 'Ch 6: Light', score: 72, avg: 68, date: 'Apr 15' },
  { subject: 'English', test: 'Ch 3: Grammar', score: 90, avg: 78, date: 'Apr 10' },
]

export const PARENT_TEST_RESULTS = [
  { id: '1', subject: 'Mathematics', test: 'Unit Test 1 — Ch 1-5', score: 85, total: 100, classAvg: 72, rank: 5, date: '2026-04-15' },
  { id: '2', subject: 'Science', test: 'Ch 6: Light Quiz', score: 72, total: 100, classAvg: 68, rank: 8, date: '2026-04-13' },
  { id: '3', subject: 'English', test: 'Grammar Assessment', score: 90, total: 100, classAvg: 78, rank: 3, date: '2026-04-10' },
  { id: '4', subject: 'Kannada', test: 'Ch 4 Practice Test', score: 65, total: 100, classAvg: 70, rank: 15, date: '2026-04-08' },
  { id: '5', subject: 'Social Science', test: 'Ch 2 Quiz', score: 55, total: 100, classAvg: 62, rank: 20, date: '2026-04-05' },
]

export const PARENT_NOTIFICATIONS = [
  { id: '1', title: 'Unit Test Results Published', message: 'Mathematics Unit Test 1 results are now available.', type: 'success' as const, date: '2026-04-22T10:00:00Z', read: false },
  { id: '2', title: 'PTM Scheduled', message: 'Parent-Teacher Meeting is scheduled for April 28th, 10 AM.', type: 'info' as const, date: '2026-04-21T09:00:00Z', read: false },
  { id: '3', title: 'Low Score Alert', message: 'Your child scored below average in Social Science Quiz.', type: 'warning' as const, date: '2026-04-20T14:00:00Z', read: true },
  { id: '4', title: 'Homework Reminder', message: 'Science lab report is pending submission.', type: 'info' as const, date: '2026-04-19T08:00:00Z', read: true },
]
