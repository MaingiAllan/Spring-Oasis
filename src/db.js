const DB_KEY = 'springoasis_school_db';

const initialData = {
  directors: [
    { id: 'dir-1', name: 'Director Albus', username: 'director', password: 'password', role: 'director' }
  ],
  students: [
    { id: 'std-1', name: 'Alice Johnson', class: 'Grade 10-A', feesDue: 50000, feesPaid: 35000, password: 'password', subjects: ['Mathematics', 'Science', 'English Literature'] },
    { id: 'std-2', name: 'Bob Smith', class: 'Grade 10-A', feesDue: 50000, feesPaid: 50000, password: 'password', subjects: ['Mathematics', 'Science', 'English Literature'] },
    { id: 'std-3', name: 'Charlie Davis', class: 'Grade 11-B', feesDue: 52000, feesPaid: 20000, password: 'password', subjects: ['Mathematics', 'Science', 'English Literature'] },
    { id: 'std-4', name: 'Diana Prince', class: 'Grade 10-A', feesDue: 50000, feesPaid: 0, password: 'password', subjects: ['Mathematics', 'Science', 'English Literature'] },
    { id: 'std-5', name: 'Ethan Hunt', class: 'Grade 11-B', feesDue: 52000, feesPaid: 45000, password: 'password', subjects: ['Mathematics', 'Science', 'English Literature'] }
  ],
  invoices: [
    {
      id: 'inv-2026-001',
      invoiceNumber: 'INV-2026-001',
      studentId: 'std-1',
      term: '2026 Term 1',
      totalAmount: 50000,
      amountPaid: 35000,
      balance: 15000,
      status: 'PARTIALLY_PAID',
      dueDate: '2026-08-30',
      items: [
        { id: 'item-1', feeType: 'TUITION', description: 'Term 1 Tuition & Academic Fee', amount: 35000 },
        { id: 'item-2', feeType: 'TRANSPORT', description: 'School Bus Transport Route A', amount: 10000 },
        { id: 'item-3', feeType: 'EXCURSION', description: 'Science Lab & Planetarium Excursion', amount: 5000 }
      ]
    },
    {
      id: 'inv-2026-002',
      invoiceNumber: 'INV-2026-002',
      studentId: 'std-2',
      term: '2026 Term 1',
      totalAmount: 50000,
      amountPaid: 50000,
      balance: 0,
      status: 'PAID',
      dueDate: '2026-08-30',
      items: [
        { id: 'item-4', feeType: 'TUITION', description: 'Term 1 Tuition & Academic Fee', amount: 35000 },
        { id: 'item-5', feeType: 'BOARDING', description: 'Boarding & Dining Services', amount: 15000 }
      ]
    },
    {
      id: 'inv-2026-003',
      invoiceNumber: 'INV-2026-003',
      studentId: 'std-3',
      term: '2026 Term 1',
      totalAmount: 52000,
      amountPaid: 20000,
      balance: 32000,
      status: 'PARTIALLY_PAID',
      dueDate: '2026-08-30',
      items: [
        { id: 'item-6', feeType: 'TUITION', description: 'Grade 11 Term 1 Tuition', amount: 40000 },
        { id: 'item-7', feeType: 'TRANSPORT', description: 'Transport Route B', amount: 12000 }
      ]
    },
    {
      id: 'inv-2026-004',
      invoiceNumber: 'INV-2026-004',
      studentId: 'std-4',
      term: '2026 Term 1',
      totalAmount: 50000,
      amountPaid: 0,
      balance: 50000,
      status: 'UNPAID',
      dueDate: '2026-08-30',
      items: [
        { id: 'item-8', feeType: 'TUITION', description: 'Grade 10 Term 1 Tuition', amount: 35000 },
        { id: 'item-9', feeType: 'BOARDING', description: 'Hostel Accommodation', amount: 15000 }
      ]
    },
    {
      id: 'inv-2026-005',
      invoiceNumber: 'INV-2026-005',
      studentId: 'std-5',
      term: '2026 Term 1',
      totalAmount: 52000,
      amountPaid: 45000,
      balance: 7000,
      status: 'PARTIALLY_PAID',
      dueDate: '2026-08-30',
      items: [
        { id: 'item-10', feeType: 'TUITION', description: 'Grade 11 Term 1 Tuition', amount: 40000 },
        { id: 'item-11', feeType: 'TRANSPORT', description: 'Transport Route A', amount: 12000 }
      ]
    }
  ],
  payments: [
    {
      id: 'pay-101',
      paymentReference: 'SO-PAY-2026-009182',
      studentId: 'std-1',
      invoiceId: 'inv-2026-001',
      amount: 35000,
      currency: 'KES',
      provider: 'MPESA_EXPRESS',
      providerTransactionId: 'RKT9102948',
      providerChannel: 'STK_PUSH',
      payerPhoneNumber: '254712345678',
      payerName: 'Mr. David Johnson',
      status: 'SUCCESS',
      paidAt: '2026-08-10T14:22:10Z',
      createdAt: '2026-08-10T14:21:45Z',
      reconciliationStatus: 'MATCHED'
    },
    {
      id: 'pay-102',
      paymentReference: 'SO-PAY-2026-008129',
      studentId: 'std-2',
      invoiceId: 'inv-2026-002',
      amount: 50000,
      currency: 'KES',
      provider: 'EQUITY_BANK',
      providerTransactionId: 'EQB-88192031',
      providerChannel: 'BANK_TRANSFER',
      payerPhoneNumber: '254722987654',
      payerName: 'Mrs. Mary Smith',
      status: 'SUCCESS',
      paidAt: '2026-08-08T09:15:00Z',
      createdAt: '2026-08-08T09:14:10Z',
      reconciliationStatus: 'MATCHED'
    },
    {
      id: 'pay-103',
      paymentReference: 'SO-PAY-2026-007421',
      studentId: 'std-3',
      invoiceId: 'inv-2026-003',
      amount: 20000,
      currency: 'KES',
      provider: 'MPESA_PAYBILL',
      providerTransactionId: 'RKS3310928',
      providerChannel: 'C2B',
      payerPhoneNumber: '254733112233',
      payerName: 'Mr. Robert Davis',
      status: 'SUCCESS',
      paidAt: '2026-08-12T11:40:00Z',
      createdAt: '2026-08-12T11:39:20Z',
      reconciliationStatus: 'MATCHED'
    },
    {
      id: 'pay-104',
      paymentReference: 'SO-PAY-2026-009942',
      studentId: 'std-5',
      invoiceId: 'inv-2026-005',
      amount: 45000,
      currency: 'KES',
      provider: 'MPESA_EXPRESS',
      providerTransactionId: 'RKT9941102',
      providerChannel: 'STK_PUSH',
      payerPhoneNumber: '254700998877',
      payerName: 'Mr. Ethan Hunt Sr.',
      status: 'SUCCESS',
      paidAt: '2026-08-13T10:05:00Z',
      createdAt: '2026-08-13T10:04:12Z',
      reconciliationStatus: 'MATCHED'
    }
  ],
  reconciliationRuns: [
    {
      id: 'rec-2026-08-13',
      runDate: '2026-08-13',
      provider: 'MPESA_EXPRESS',
      totalInternalRecords: 48,
      totalProviderRecords: 48,
      matchedRecords: 46,
      discrepancyRecords: 2,
      status: 'COMPLETED'
    }
  ],
  reconciliationDiscrepancies: [
    {
      id: 'disc-001',
      paymentReference: 'SO-PAY-2026-00192',
      providerTransactionId: 'RKT9918231',
      discrepancyType: 'UNMATCHED_INTERNAL',
      internalAmount: 0,
      providerAmount: 15000,
      status: 'OPEN',
      resolutionNotes: 'Gateway confirmed transaction RKT9918231; webhook delivery delayed. Pending auto-backfill to student std-4.'
    },
    {
      id: 'disc-002',
      paymentReference: 'SO-PAY-2026-00344',
      providerTransactionId: 'RKT9941102',
      discrepancyType: 'AMOUNT_MISMATCH',
      internalAmount: 52000,
      providerAmount: 45000,
      status: 'RESOLVED',
      resolutionNotes: 'Partial fee payment acknowledged. Balance of KES 7,000 carried forward to due date.'
    }
  ],
  auditLogs: [
    {
      id: 'aud-1',
      actorId: 'SYSTEM_WEBHOOK',
      actorRole: 'AUTOMATED_PAYMENT_GATEWAY',
      action: 'PAYMENT_SUCCESS_VERIFIED',
      entityType: 'PAYMENT',
      entityId: 'SO-PAY-2026-009942',
      ipAddress: '196.201.214.2',
      timestamp: '2026-08-13T10:05:00Z'
    }
  ],
  teachers: [
    { id: 'tch-1', name: 'Mrs. Sarah Connor', subject: 'Mathematics', class: 'Grade 10-A', username: 'sarah', password: 'password' },
    { id: 'tch-2', name: 'Mr. John Keating', subject: 'English Literature', class: 'Grade 11-B', username: 'john', password: 'password' },
    { id: 'tch-3', name: 'Dr. Bruce Banner', subject: 'Science', class: 'Grade 10-A', username: 'bruce', password: 'password' }
  ],
  employees: [
    { 
      id: 'emp-1', 
      name: 'Chef Marcus Wright', 
      role: 'Kitchen Supervisor', 
      username: 'marcus',
      password: 'password',
      attendance: [
        { date: '2026-06-03', clockIn: '07:30 AM', clockOut: '04:15 PM', status: 'Present' },
        { date: '2026-06-04', clockIn: '07:28 AM', clockOut: '04:30 PM', status: 'Present' }
      ] 
    },
    { 
      id: 'emp-2', 
      name: 'Linda Hamilton', 
      role: 'Facilities Manager', 
      username: 'linda',
      password: 'password',
      attendance: [
        { date: '2026-06-03', clockIn: '08:00 AM', clockOut: '05:00 PM', status: 'Present' },
        { date: '2026-06-04', clockIn: '07:55 AM', clockOut: '05:05 PM', status: 'Present' }
      ] 
    }
  ],
  homework: [
    { id: 'hw-1', teacherId: 'tch-1', teacherName: 'Mrs. Sarah Connor', class: 'Grade 10-A', subject: 'Mathematics', title: 'Quadratic Equations Practice', description: 'Solve exercises 1-15 on page 78. Show all working details.', datePosted: '2026-06-04', dueDate: '2026-06-08' },
    { id: 'hw-2', teacherId: 'tch-3', teacherName: 'Dr. Bruce Banner', class: 'Grade 10-A', subject: 'Science', title: 'Photosynthesis Lab Report', description: 'Write up a 2-page summary of the light-dependent reactions based on our class lab.', datePosted: '2026-06-05', dueDate: '2026-06-10' },
    { id: 'hw-3', teacherId: 'tch-2', teacherName: 'Mr. John Keating', class: 'Grade 11-B', subject: 'English Literature', title: 'O Captain! My Captain! Essay', description: 'Write a 500-word analysis on Walt Whitman\'s symbolism and structure.', datePosted: '2026-06-05', dueDate: '2026-06-12' }
  ],
  studentAttendance: [
    { id: 'satt-1', studentId: 'std-1', studentName: 'Alice Johnson', class: 'Grade 10-A', date: '2026-06-04', status: 'Present' },
    { id: 'satt-2', studentId: 'std-2', studentName: 'Bob Smith', class: 'Grade 10-A', date: '2026-06-04', status: 'Present' },
    { id: 'satt-3', studentId: 'std-4', studentName: 'Diana Prince', class: 'Grade 10-A', date: '2026-06-04', status: 'Absent' },
    { id: 'satt-4', studentId: 'std-1', studentName: 'Alice Johnson', class: 'Grade 10-A', date: '2026-06-05', status: 'Present' },
    { id: 'satt-5', studentId: 'std-2', studentName: 'Bob Smith', class: 'Grade 10-A', date: '2026-06-05', status: 'Late' },
    { id: 'satt-6', studentId: 'std-4', studentName: 'Diana Prince', class: 'Grade 10-A', date: '2026-06-05', status: 'Present' }
  ],
  examScores: [
    { id: 'scr-1', studentId: 'std-1', studentName: 'Alice Johnson', subject: 'Mathematics', score: 94, assessment: 'Midterm', date: '2026-06-02', grader: 'Mrs. Sarah Connor' },
    { id: 'scr-2', studentId: 'std-2', studentName: 'Bob Smith', subject: 'Mathematics', score: 88, assessment: 'Midterm', date: '2026-06-02', grader: 'Mrs. Sarah Connor' },
    { id: 'scr-3', studentId: 'std-4', studentName: 'Diana Prince', subject: 'Mathematics', score: 72, assessment: 'Midterm', date: '2026-06-02', grader: 'Mrs. Sarah Connor' },
    { id: 'scr-4', studentId: 'std-1', studentName: 'Alice Johnson', subject: 'Science', score: 98, assessment: 'Midterm', date: '2026-06-03', grader: 'Dr. Bruce Banner' },
    { id: 'scr-5', studentId: 'std-2', studentName: 'Bob Smith', subject: 'Science', score: 85, assessment: 'Midterm', date: '2026-06-03', grader: 'Dr. Bruce Banner' },
    { id: 'scr-6', studentId: 'std-3', studentName: 'Charlie Davis', subject: 'English Literature', score: 90, assessment: 'Midterm', date: '2026-06-04', grader: 'Mr. John Keating' },
    { id: 'scr-7', studentId: 'std-5', studentName: 'Ethan Hunt', subject: 'English Literature', score: 79, assessment: 'Midterm', date: '2026-06-04', grader: 'Mr. John Keating' }
  ],
  trips: [
    { id: 'trp-1', title: 'Museum of Natural History', date: '2026-06-18', cost: 45, description: 'Excursion to view the dinosaur fossils and geological history exhibits.', postedDate: '2026-06-02' },
    { id: 'trp-2', title: 'Planetarium & Space Center', date: '2026-06-25', cost: 60, description: 'Interactive dome show exploring the solar system and star navigation.', postedDate: '2026-06-04' }
  ],
  closingDays: [
    { id: 'cls-1', title: 'Summer Solstice Holiday', startDate: '2026-06-21', endDate: '2026-06-22', reason: 'School closed for the annual Summer Solstice festival.' }
  ],
  inventory: [
    { id: 'inv-1', name: 'Basmati Rice', quantity: 75, unit: 'kg', lastUpdated: '2026-06-04', notes: 'Quality long grain rice for student lunches.', threshold: 25 },
    { id: 'inv-2', name: 'Sunflower Oil', quantity: 18, unit: 'Liters', lastUpdated: '2026-06-04', notes: 'For general frying and cooking.', threshold: 10 },
    { id: 'inv-3', name: 'Baking Flour', quantity: 40, unit: 'kg', lastUpdated: '2026-06-05', notes: 'Whole wheat and all-purpose mix.', threshold: 15 },
    { id: 'inv-4', name: 'Canned Tomatoes', quantity: 60, unit: 'cans', lastUpdated: '2026-06-03', notes: 'For pasta and stew bases.', threshold: 20 },
    { id: 'inv-5', name: 'Fine Sugar', quantity: 8, unit: 'kg', lastUpdated: '2026-06-05', notes: 'Low stock. Needs ordering soon.', threshold: 10 }
  ]
};

export const getDB = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    const parsed = JSON.parse(data);
    if (!parsed.directors || !Array.isArray(parsed.directors) || parsed.directors.length === 0) parsed.directors = initialData.directors;
    if (!parsed.teachers || !Array.isArray(parsed.teachers) || parsed.teachers.length === 0) parsed.teachers = initialData.teachers;
    if (!parsed.employees || !Array.isArray(parsed.employees) || parsed.employees.length === 0) parsed.employees = initialData.employees;
    if (!parsed.students || !Array.isArray(parsed.students) || parsed.students.length === 0) parsed.students = initialData.students;
    if (!parsed.invoices || !Array.isArray(parsed.invoices) || parsed.invoices.length === 0) parsed.invoices = initialData.invoices;
    if (!parsed.payments || !Array.isArray(parsed.payments) || parsed.payments.length === 0) parsed.payments = initialData.payments;
    if (!parsed.reconciliationRuns) parsed.reconciliationRuns = initialData.reconciliationRuns;
    if (!parsed.reconciliationDiscrepancies) parsed.reconciliationDiscrepancies = initialData.reconciliationDiscrepancies;
    if (!parsed.auditLogs) parsed.auditLogs = initialData.auditLogs;
    return parsed;
  } catch (e) {
    console.error("Failed to parse DB, resetting...", e);
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
};

export const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};
