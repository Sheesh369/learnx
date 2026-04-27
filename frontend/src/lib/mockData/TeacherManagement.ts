interface MockTeacher {
  id: string; name: string; email: string; phone: string
  subjects: string[]; classes: string[]; status: 'active' | 'inactive'
}

export const MOCK_TEACHERS: MockTeacher[] = [
  { id: '1', name: 'Ramesh Kumar', email: 'ramesh@ssb.edu', phone: '+91 98765 43210', subjects: ['Mathematics'], classes: ['9A', '10B'], status: 'active' },
  { id: '2', name: 'Priya Sharma', email: 'priya@ssb.edu', phone: '+91 98765 43211', subjects: ['Science'], classes: ['9A', '9B', '10A'], status: 'active' },
  { id: '3', name: 'Anita Rao', email: 'anita@ssb.edu', phone: '+91 98765 43212', subjects: ['English'], classes: ['8A', '8B', '9A'], status: 'active' },
  { id: '4', name: 'Deepa G', email: 'deepa@ssb.edu', phone: '+91 98765 43213', subjects: ['Kannada'], classes: ['6A', '7A', '8A'], status: 'active' },
  { id: '5', name: 'Meera Singh', email: 'meera@ssb.edu', phone: '+91 98765 43214', subjects: ['Hindi'], classes: ['5A', '6A', '7A'], status: 'inactive' },
  { id: '6', name: 'Sunil K', email: 'sunil@ssb.edu', phone: '+91 98765 43215', subjects: ['Social Science'], classes: ['8A', '9A', '10A'], status: 'active' },
]
