const DB_KEY = 'springoasis_school_db';

const initialData = {
  directors: [
    { id: 'dir-1', name: 'Director Albus', username: 'director', password: 'password', role: 'director' }
  ],
  students: [
    { id: 'std-1', name: 'Alice Johnson', class: 'Grade 10-A', feesDue: 5000, feesPaid: 1500, password: 'password', payments: [{ id: 'pay-1', amount: 1500, date: '2026-05-15', method: 'Bank Transfer' }] },
    { id: 'std-2', name: 'Bob Smith', class: 'Grade 10-A', feesDue: 5000, feesPaid: 5000, password: 'password', payments: [{ id: 'pay-2', amount: 5000, date: '2026-05-10', method: 'Credit Card' }] },
    { id: 'std-3', name: 'Charlie Davis', class: 'Grade 11-B', feesDue: 5200, feesPaid: 2000, password: 'password', payments: [{ id: 'pay-3', amount: 2000, date: '2026-05-20', method: 'Cash' }] },
    { id: 'std-4', name: 'Diana Prince', class: 'Grade 10-A', feesDue: 5000, feesPaid: 0, password: 'password', payments: [] },
    { id: 'std-5', name: 'Ethan Hunt', class: 'Grade 11-B', feesDue: 5200, feesPaid: 4500, password: 'password', payments: [{ id: 'pay-4', amount: 4500, date: '2026-05-25', method: 'Bank Transfer' }] }
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
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse DB, resetting...", e);
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
};

export const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};
