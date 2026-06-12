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

  const loginUser = (usernameOrAdmissionNumber, password) => {
    const directors = db.directors || [];
    const students = db.students || [];
    const teachers = db.teachers || [];
    const employees = db.employees || [];

    // 1. Check Directors
    const director = directors.find(
      (d) => d.username.toLowerCase() === usernameOrAdmissionNumber.toLowerCase() && d.password === password
    );
    if (director) {
      const profile = { id: director.id, name: director.name, username: director.username, role: 'director', initials: 'DA' };
      setCurrentUser(profile);
      return profile;
    }

    // 2. Check Teachers
    const teacher = teachers.find(
      (t) => t.username.toLowerCase() === usernameOrAdmissionNumber.toLowerCase() && t.password === password
    );
    if (teacher) {
      const names = teacher.name.split(' ');
      const initials = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const profile = { id: teacher.id, name: teacher.name, username: teacher.username, role: 'teacher', subject: teacher.subject, class: teacher.class, initials };
      setCurrentUser(profile);
      return profile;
    }

    // 3. Check Employees
    const employee = employees.find(
      (e) => e.username.toLowerCase() === usernameOrAdmissionNumber.toLowerCase() && e.password === password
    );
    if (employee) {
      const names = employee.name.split(' ');
      const initials = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const profile = { id: employee.id, name: employee.name, username: employee.username, role: 'employee', jobRole: employee.role, initials };
      setCurrentUser(profile);
      return profile;
    }

    // 4. Check Students
    const student = students.find(
      (s) => s.id.toLowerCase() === usernameOrAdmissionNumber.toLowerCase() && s.password === password
    );
    if (student) {
      const names = student.name.split(' ');
      const initials = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const profile = { id: student.id, name: student.name, role: 'student', class: student.class, initials };
      setCurrentUser(profile);
      return profile;
    }

    return null;
  };

  const logoutUser = () => {
    setCurrentUser(null);
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
            payments: []
          }
        ]
      };
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

  const addPayment = (studentId, amount, method) => {
    updateDB((prev) => {
      const updatedStudents = prev.students.map((student) => {
        if (student.id === studentId) {
          const feesPaid = student.feesPaid + Number(amount);
          const payments = [
            ...student.payments,
            {
              id: `pay-${Date.now()}`,
              amount: Number(amount),
              date: new Date().toISOString().split('T')[0],
              method
            }
          ];
          return { ...student, feesPaid, payments };
        }
        return student;
      });

      return {
        ...prev,
        students: updatedStudents
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
        updateUserCredentials,
        admitStudent,
        admitTeacher,
        admitEmployee,
        addTrip,
        updateTrip,        // NEW
        deleteTrip,        // NEW
        addClosingDay,
        updateClosingDay,  // NEW
        deleteClosingDay,  // NEW
        addPayment,
        updateStudentFees,
        addHomework,
        recordStudentAttendance,
        recordExamScore,
        employeeClockIn,
        employeeClockOut,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem
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