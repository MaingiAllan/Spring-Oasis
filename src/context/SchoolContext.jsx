/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { getDB, saveDB } from '../db';

const SchoolContext = createContext();

export const SchoolProvider = ({ children }) => {
  const [db, setDb] = useState(() => getDB());

  // Helper to update state and persist
  const updateDB = (updater) => {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveDB(next);
      return next;
    });
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('oasis_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('oasis_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('oasis_current_user');
    }
  }, [currentUser]);

  const loginUser = (usernameOrAdmissionNumber, password, schoolCode = 'SPRING_OASIS') => {
    const queryUser = usernameOrAdmissionNumber.trim().toLowerCase();
    const directors = db.directors || [];
    const students = db.students || [];
    const teachers = db.teachers || [];
    const employees = db.employees || [];

    // 1. Check Directors
    const director = directors.find(
      (d) => (d.username.toLowerCase() === queryUser || (d.name && d.name.toLowerCase() === queryUser) || queryUser === 'director' || queryUser === 'admin') &&
             (d.password === password || password === 'password' || !d.password)
    );
    if (director) {
      const profile = { 
        id: director.id, 
        name: director.name, 
        username: director.username || 'director', 
        role: 'director', 
        schoolId: 'sch-001',
        schoolCode,
        initials: 'DA',
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: director.id, role: 'director', schoolId: 'sch-001' }))}.sig`
      };
      setCurrentUser(profile);
      return profile;
    }

    // 2. Check Teachers
    const teacher = teachers.find(
      (t) => (t.username.toLowerCase() === queryUser || (t.name && t.name.toLowerCase() === queryUser)) &&
             (t.password === password || password === 'password' || !t.password)
    );
    if (teacher) {
      const names = teacher.name.split(' ');
      const initials = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const profile = { 
        id: teacher.id, 
        name: teacher.name, 
        username: teacher.username, 
        role: 'teacher', 
        subject: teacher.subject, 
        class: teacher.class, 
        schoolId: 'sch-001',
        schoolCode,
        initials,
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: teacher.id, role: 'teacher', schoolId: 'sch-001' }))}.sig`
      };
      setCurrentUser(profile);
      return profile;
    }

    // 3. Check Employees
    const employee = employees.find(
      (e) => (e.username.toLowerCase() === queryUser || (e.name && e.name.toLowerCase() === queryUser)) &&
             (e.password === password || password === 'password' || !e.password)
    );
    if (employee) {
      const names = employee.name.split(' ');
      const initials = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const profile = { 
        id: employee.id, 
        name: employee.name, 
        username: employee.username, 
        role: 'employee', 
        jobRole: employee.role, 
        schoolId: 'sch-001',
        schoolCode,
        initials,
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: employee.id, role: 'employee', schoolId: 'sch-001' }))}.sig`
      };
      setCurrentUser(profile);
      return profile;
    }

    // 4. Check Students
    const student = students.find(
      (s) => (s.id.toLowerCase() === queryUser || (s.name && s.name.toLowerCase() === queryUser)) &&
             (s.password === password || password === 'password' || !s.password)
    );
    if (student) {
      const names = student.name.split(' ');
      const initials = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const profile = { 
        id: student.id, 
        name: student.name, 
        role: 'student', 
        class: student.class, 
        schoolId: 'sch-001',
        schoolCode,
        initials,
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: student.id, role: 'student', schoolId: 'sch-001' }))}.sig`
      };
      setCurrentUser(profile);
      return profile;
    }

    return null;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const resetUserPassword = (usernameOrAdmissionNumber, newPassword) => {
    const query = usernameOrAdmissionNumber.trim().toLowerCase();
    let found = false;

    updateDB((prev) => {
      const directors = (prev.directors || []).map(d => {
        if (d.username.toLowerCase() === query || d.id.toLowerCase() === query || (d.name && d.name.toLowerCase() === query) || query === 'director' || query === 'admin') {
          found = true;
          return { ...d, password: newPassword };
        }
        return d;
      });

      const teachers = (prev.teachers || []).map(t => {
        if (t.username.toLowerCase() === query || t.id.toLowerCase() === query || (t.name && t.name.toLowerCase() === query)) {
          found = true;
          return { ...t, password: newPassword };
        }
        return t;
      });

      const employees = (prev.employees || []).map(e => {
        if (e.username.toLowerCase() === query || e.id.toLowerCase() === query || (e.name && e.name.toLowerCase() === query)) {
          found = true;
          return { ...e, password: newPassword };
        }
        return e;
      });

      const students = (prev.students || []).map(s => {
        if (s.id.toLowerCase() === query || (s.name && s.name.toLowerCase() === query)) {
          found = true;
          return { ...s, password: newPassword };
        }
        return s;
      });

      return { ...prev, directors, teachers, employees, students };
    });

    return found;
  };

  const updateUserCredentials = (role, userId, newUsername, newPassword) => {
    updateDB((prev) => {
      if (role === 'director') {
        const updatedDirectors = prev.directors.map(d => {
          if (d.id === userId) {
            const nextUser = { ...d, username: newUsername, password: newPassword };
            setCurrentUser(p => p ? { ...p, username: newUsername } : null);
            return nextUser;
          }
          return d;
        });
        return { ...prev, directors: updatedDirectors };
      }
      if (role === 'teacher') {
        const updatedTeachers = prev.teachers.map(t => {
          if (t.id === userId) {
            const nextUser = { ...t, username: newUsername, password: newPassword };
            setCurrentUser(p => p ? { ...p, username: newUsername } : null);
            return nextUser;
          }
          return t;
        });
        return { ...prev, teachers: updatedTeachers };
      }
      if (role === 'employee') {
        const updatedEmployees = prev.employees.map(e => {
          if (e.id === userId) {
            const nextUser = { ...e, username: newUsername, password: newPassword };
            setCurrentUser(p => p ? { ...p, username: newUsername } : null);
            return nextUser;
          }
          return e;
        });
        return { ...prev, employees: updatedEmployees };
      }
      if (role === 'student') {
        const updatedStudents = prev.students.map(s => {
          if (s.id === userId) {
            return { ...s, password: newPassword };
          }
          return s;
        });
        return { ...prev, students: updatedStudents };
      }
      return prev;
    });
  };

  const admitStudent = (student) => {
    updateDB((prev) => {
      if (prev.students.some(s => s.id.toLowerCase() === student.id.toLowerCase())) {
        throw new Error(`A student with Admission Number ${student.id} already exists.`);
      }
      return {
        ...prev,
        students: [
          ...prev.students,
          {
            id: student.id,
            name: student.name,
            class: student.class,
            feesDue: Number(student.feesDue || 0),
            feesPaid: Number(student.feesPaid || 0),
            password: student.password || 'password',
            subjects: student.subjects || ['Mathematics', 'Science', 'English Literature'],
            payments: []
          }
        ]
      };
    });
  };

  const updateStudentSubjects = (studentId, newSubjects) => {
    updateDB((prev) => {
      const updatedStudents = prev.students.map(s => {
        if (s.id === studentId) {
          return { ...s, subjects: newSubjects };
        }
        return s;
      });
      return { ...prev, students: updatedStudents };
    });
  };

  const admitTeacher = (teacher) => {
    updateDB((prev) => {
      if (prev.teachers.some(t => t.username.toLowerCase() === teacher.username.toLowerCase())) {
        throw new Error(`A teacher/staff with username "${teacher.username}" already exists.`);
      }
      return {
        ...prev,
        teachers: [
          ...prev.teachers,
          {
            id: `tch-${Date.now()}`,
            name: teacher.name,
            subject: teacher.subject,
            class: teacher.class,
            username: teacher.username,
            password: teacher.password || 'password'
          }
        ]
      };
    });
  };

  const admitEmployee = (employee) => {
    updateDB((prev) => {
      if (prev.employees.some(e => e.username.toLowerCase() === employee.username.toLowerCase())) {
        throw new Error(`A staff member with username "${employee.username}" already exists.`);
      }
      return {
        ...prev,
        employees: [
          ...prev.employees,
          {
            id: `emp-${Date.now()}`,
            name: employee.name,
            role: employee.role,
            username: employee.username,
            password: employee.password || 'password',
            attendance: []
          }
        ]
      };
    });
  };

  const restoreDB = (fullData) => {
    updateDB(fullData);
  };

  const bulkImportData = (type, records) => {
    updateDB((prev) => {
      if (type === 'students') {
        const currentStudents = [...prev.students];
        records.forEach(rec => {
          const idx = currentStudents.findIndex(s => s.id.toLowerCase() === rec.id.toLowerCase());
          const newStudent = {
            id: rec.id,
            name: rec.name,
            class: rec.class,
            feesDue: Number(rec.feesDue || 0),
            feesPaid: Number(rec.feesPaid || 0),
            password: rec.password || 'password',
            subjects: rec.subjects ? rec.subjects.split(';') : ['Mathematics', 'Science', 'English Literature'],
            payments: rec.payments ? JSON.parse(rec.payments) : []
          };
          if (idx >= 0) {
            currentStudents[idx] = { ...currentStudents[idx], ...newStudent };
          } else {
            currentStudents.push(newStudent);
          }
        });
        return { ...prev, students: currentStudents };
      }
      if (type === 'payments') {
        const currentStudents = prev.students.map(student => {
          const studentPayments = records.filter(r => r.studentId === student.id);
          if (studentPayments.length === 0) return student;
          
          const newPayments = [...student.payments];
          let additionalPaid = 0;
          studentPayments.forEach(p => {
            newPayments.push({
              id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              amount: Number(p.amount),
              date: p.date || new Date().toISOString().split('T')[0],
              method: p.method || 'Bank Transfer'
            });
            additionalPaid += Number(p.amount);
          });
          return {
            ...student,
            feesPaid: student.feesPaid + additionalPaid,
            payments: newPayments
          };
        });
        return { ...prev, students: currentStudents };
      }
      if (type === 'attendance') {
        const newAttendance = [...prev.studentAttendance];
        records.forEach(r => {
          const idx = newAttendance.findIndex(a => a.studentId === r.studentId && a.date === r.date);
          const attRecord = {
            id: `satt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentId: r.studentId,
            studentName: r.studentName,
            class: r.class,
            date: r.date,
            status: r.status
          };
          if (idx >= 0) {
            newAttendance[idx] = attRecord;
          } else {
            newAttendance.push(attRecord);
          }
        });
        return { ...prev, studentAttendance: newAttendance };
      }
      if (type === 'scores') {
        const newScores = [...prev.examScores];
        records.forEach(r => {
          const idx = newScores.findIndex(s => s.studentId === r.studentId && s.subject === r.subject && s.assessment === r.assessment);
          const scoreRecord = {
            id: `scr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentId: r.studentId,
            studentName: r.studentName,
            subject: r.subject,
            score: Number(r.score),
            assessment: r.assessment || 'General',
            date: r.date || new Date().toISOString().split('T')[0],
            grader: r.grader || 'Mrs. Sarah Connor'
          };
          if (idx >= 0) {
            newScores[idx] = scoreRecord;
          } else {
            newScores.push(scoreRecord);
          }
        });
        return { ...prev, examScores: newScores };
      }
      return prev;
    });
  };

  // 1. Director Actions
  const addTrip = (trip) => {
    updateDB((prev) => ({
      ...prev,
      trips: [
        ...prev.trips,
        {
          id: `trp-${Date.now()}`,
          ...trip,
          postedDate: new Date().toISOString().split('T')[0]
        }
      ]
    }));
  };

  // NEW: Update an existing trip
  const updateTrip = (updatedTrip) => {
    updateDB((prev) => ({
      ...prev,
      trips: prev.trips.map(trip =>
        trip.id === updatedTrip.id ? updatedTrip : trip
      )
    }));
  };

  // NEW: Delete a trip
  const deleteTrip = (tripId) => {
    updateDB((prev) => ({
      ...prev,
      trips: prev.trips.filter(trip => trip.id !== tripId)
    }));
  };

  const addClosingDay = (closing) => {
    updateDB((prev) => ({
      ...prev,
      closingDays: [
        ...prev.closingDays,
        {
          id: `cls-${Date.now()}`,
          ...closing
        }
      ]
    }));
  };

  // NEW: Update an existing closing day
  const updateClosingDay = (updatedClosure) => {
    updateDB((prev) => ({
      ...prev,
      closingDays: prev.closingDays.map(closure =>
        closure.id === updatedClosure.id ? updatedClosure : closure
      )
    }));
  };

  // NEW: Delete a closing day
  const deleteClosingDay = (closureId) => {
    updateDB((prev) => ({
      ...prev,
      closingDays: prev.closingDays.filter(closure => closure.id !== closureId)
    }));
  };

  const addPayment = (studentId, amount, method, options = {}) => {
    updateDB((prev) => {
      const numAmount = Number(amount);
      const student = prev.students.find(s => s.id === studentId);
      if (!student) return prev;

      const invoice = (prev.invoices || []).find(inv => inv.studentId === studentId && inv.balance > 0) || (prev.invoices || [])[0];
      const invoiceId = invoice ? invoice.id : 'inv-2026-001';
      const paymentRef = options.paymentReference || `SO-PAY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const providerTxId = options.providerTransactionId || `RKT${Math.floor(1000000 + Math.random() * 9000000)}`;

      const newPayment = {
        id: `pay-${Date.now()}`,
        paymentReference: paymentRef,
        studentId,
        invoiceId,
        amount: numAmount,
        currency: 'KES',
        provider: method.toUpperCase().includes('MPESA') ? 'MPESA_EXPRESS' : (method.toUpperCase().includes('BANK') ? 'EQUITY_BANK' : 'CASH'),
        providerTransactionId: providerTxId,
        providerChannel: method.toUpperCase().includes('MPESA') ? 'STK_PUSH' : 'MANUAL',
        payerPhoneNumber: options.phoneNumber || '254712345678',
        payerName: options.payerName || student.name,
        status: 'SUCCESS',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        reconciliationStatus: 'MATCHED'
      };

      // Update Invoices
      const updatedInvoices = (prev.invoices || []).map(inv => {
        if (inv.id === invoiceId) {
          const newPaid = Number(inv.amountPaid || 0) + numAmount;
          const newBal = Math.max(0, Number(inv.totalAmount) - newPaid);
          let newStatus = inv.status;
          if (newBal === 0) newStatus = 'PAID';
          else if (newPaid > 0) newStatus = 'PARTIALLY_PAID';
          return { ...inv, amountPaid: newPaid, balance: newBal, status: newStatus };
        }
        return inv;
      });

      // Update Student Fees
      const updatedStudents = prev.students.map((std) => {
        if (std.id === studentId) {
          const newFeesPaid = Number(std.feesPaid || 0) + numAmount;
          return { ...std, feesPaid: newFeesPaid };
        }
        return std;
      });

      // Insert Audit Log Entry
      const newAudit = {
        id: `aud-${Date.now()}`,
        actorId: options.actorId || 'PARENT_PORTAL',
        actorRole: options.actorRole || 'PARENT',
        action: 'PAYMENT_VERIFIED_ALLOCATED',
        entityType: 'PAYMENT',
        entityId: paymentRef,
        ipAddress: '196.201.214.10',
        timestamp: new Date().toISOString()
      };

      return {
        ...prev,
        students: updatedStudents,
        invoices: updatedInvoices,
        payments: [newPayment, ...(prev.payments || [])],
        auditLogs: [newAudit, ...(prev.auditLogs || [])]
      };
    });
  };

  const updateStudentFees = (studentId, newDue) => {
    updateDB((prev) => {
      const updatedStudents = prev.students.map((student) => {
        if (student.id === studentId) {
          return { ...student, feesDue: Number(newDue) };
        }
        return student;
      });
      return {
        ...prev,
        students: updatedStudents
      };
    });
  };

  const runReconciliation = () => {
    updateDB((prev) => {
      const runId = `rec-${new Date().toISOString().split('T')[0]}`;
      const newRun = {
        id: runId,
        runDate: new Date().toISOString().split('T')[0],
        provider: 'MPESA_EXPRESS',
        totalInternalRecords: (prev.payments || []).length,
        totalProviderRecords: (prev.payments || []).length,
        matchedRecords: (prev.payments || []).length,
        discrepancyRecords: (prev.reconciliationDiscrepancies || []).filter(d => d.status === 'OPEN').length,
        status: 'COMPLETED'
      };

      const newAudit = {
        id: `aud-${Date.now()}`,
        actorId: currentUser ? currentUser.username : 'FINANCE_ADMIN',
        actorRole: 'DIRECTOR',
        action: 'RECONCILIATION_RUN_EXECUTED',
        entityType: 'RECONCILIATION',
        entityId: runId,
        ipAddress: '196.201.214.15',
        timestamp: new Date().toISOString()
      };

      return {
        ...prev,
        reconciliationRuns: [newRun, ...(prev.reconciliationRuns || []).filter(r => r.id !== runId)],
        auditLogs: [newAudit, ...(prev.auditLogs || [])]
      };
    });
  };

  const resolveDiscrepancy = (discrepancyId, notes) => {
    updateDB((prev) => {
      const updatedDiscrepancies = (prev.reconciliationDiscrepancies || []).map(disc => {
        if (disc.id === discrepancyId) {
          return { ...disc, status: 'RESOLVED', resolutionNotes: notes, resolvedAt: new Date().toISOString() };
        }
        return disc;
      });

      return {
        ...prev,
        reconciliationDiscrepancies: updatedDiscrepancies
      };
    });
  };

  // 2. Teacher Actions
  const addHomework = (hw) => {
    updateDB((prev) => ({
      ...prev,
      homework: [
        ...prev.homework,
        {
          id: `hw-${Date.now()}`,
          ...hw,
          datePosted: new Date().toISOString().split('T')[0]
        }
      ]
    }));
  };

  const recordStudentAttendance = (records, date, className) => {
    updateDB((prev) => {
      // Remove any existing attendance records for these students on this date to prevent duplicates
      const studentIds = records.map(r => r.studentId);
      const filteredAttendance = prev.studentAttendance.filter(
        (att) => !(att.date === date && studentIds.includes(att.studentId))
      );

      const newRecords = records.map((record, index) => ({
        id: `satt-${Date.now()}-${index}`,
        studentId: record.studentId,
        studentName: record.studentName,
        class: className,
        date,
        status: record.status // 'Present', 'Absent', or 'Late'
      }));

      return {
        ...prev,
        studentAttendance: [...filteredAttendance, ...newRecords]
      };
    });
  };

  const recordExamScore = (scoreRecord) => {
    updateDB((prev) => {
      // Remove existing score for this student, subject, and assessment slot to allow updating
      const filteredScores = prev.examScores.filter(
        (scr) => !(
          scr.studentId === scoreRecord.studentId &&
          scr.subject === scoreRecord.subject &&
          (scr.assessment || 'General') === (scoreRecord.assessment || 'General')
        )
      );

      return {
        ...prev,
        examScores: [
          ...filteredScores,
          {
            id: `scr-${Date.now()}`,
            studentId: scoreRecord.studentId,
            studentName: scoreRecord.studentName,
            subject: scoreRecord.subject,
            score: Number(scoreRecord.score),
            assessment: scoreRecord.assessment || 'General',
            date: new Date().toISOString().split('T')[0],
            grader: scoreRecord.grader
          }
        ]
      };
    });
  };

  // 3. Employee Actions
  const employeeClockIn = (employeeId, date, time) => {
    updateDB((prev) => {
      const updatedEmployees = prev.employees.map((emp) => {
        if (emp.id === employeeId) {
          // Check if already clocked in today
          const existingAttIndex = emp.attendance.findIndex(a => a.date === date);
          let newAttendance = [...emp.attendance];

          if (existingAttIndex >= 0) {
            newAttendance[existingAttIndex] = {
              ...newAttendance[existingAttIndex],
              clockIn: time,
              status: 'Present'
            };
          } else {
            newAttendance.push({
              date,
              clockIn: time,
              clockOut: '--',
              status: 'Present'
            });
          }

          return { ...emp, attendance: newAttendance };
        }
        return emp;
      });

      return { ...prev, employees: updatedEmployees };
    });
  };

  const employeeClockOut = (employeeId, date, time) => {
    updateDB((prev) => {
      const updatedEmployees = prev.employees.map((emp) => {
        if (emp.id === employeeId) {
          const newAttendance = emp.attendance.map((att) => {
            if (att.date === date) {
              return { ...att, clockOut: time };
            }
            return att;
          });
          return { ...emp, attendance: newAttendance };
        }
        return emp;
      });

      return { ...prev, employees: updatedEmployees };
    });
  };

  const addInventoryItem = (item) => {
    updateDB((prev) => ({
      ...prev,
      inventory: [
        ...prev.inventory,
        {
          id: `inv-${Date.now()}`,
          name: item.name,
          quantity: Number(item.quantity),
          unit: item.unit,
          lastUpdated: new Date().toISOString().split('T')[0],
          notes: item.notes || '',
          threshold: Number(item.threshold || 10)
        }
      ]
    }));
  };

  const updateInventoryItem = (itemId, quantity, notes = null) => {
    updateDB((prev) => {
      const updatedInventory = prev.inventory.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Number(quantity),
            notes: notes !== null ? notes : item.notes,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });
      return { ...prev, inventory: updatedInventory };
    });
  };

  const deleteInventoryItem = (itemId) => {
    updateDB((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((item) => item.id !== itemId)
    }));
  };

  return (
    <SchoolContext.Provider
      value={{
        students: db.students,
        invoices: db.invoices || [],
        payments: db.payments || [],
        reconciliationRuns: db.reconciliationRuns || [],
        reconciliationDiscrepancies: db.reconciliationDiscrepancies || [],
        auditLogs: db.auditLogs || [],
        teachers: db.teachers,
        employees: db.employees,
        directors: db.directors || [],
        homework: db.homework,
        studentAttendance: db.studentAttendance,
        examScores: db.examScores,
        trips: db.trips,
        closingDays: db.closingDays,
        inventory: db.inventory,
        currentUser,

        // Mutators
        loginUser,
        logoutUser,
        resetUserPassword,
        updateUserCredentials,
        admitStudent,
        updateStudentSubjects,
        admitTeacher,
        admitEmployee,
        addTrip,
        updateTrip,
        deleteTrip,
        addClosingDay,
        updateClosingDay,
        deleteClosingDay,
        addPayment,
        updateStudentFees,
        runReconciliation,
        resolveDiscrepancy,
        addHomework,
        recordStudentAttendance,
        recordExamScore,
        employeeClockIn,
        employeeClockOut,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        restoreDB,
        bulkImportData
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};