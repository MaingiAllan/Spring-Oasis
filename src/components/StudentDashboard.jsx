import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BookOpen, DollarSign, Calendar, Compass, Award, FileText, CheckCircle2, Settings } from 'lucide-react';

export default function StudentDashboard({ overrideStudentId }) {
  const {
    students,
    homework,
    trips,
    closingDays,
    examScores,
    studentAttendance,
    updateUserCredentials
  } = useSchool();

  // Selected student
  const defaultStudentId = 'std-1';
  const activeStudentId = overrideStudentId || defaultStudentId;
  const student = students.find(s => s.id === activeStudentId) || students[0];

  const [activeSubTab, setActiveSubTab] = useState('summary'); // summary, homework, trips, finance, settings

  // Settings form states
  const [settingsForm, setSettingsForm] = useState({ password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  if (!student) {
    return <div className="empty-state">No student records found.</div>;
  }

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    if (!settingsForm.password) {
      setSettingsError('Password is required.');
      return;
    }
    if (settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsError('Passwords do not match.');
      return;
    }
    updateUserCredentials('student', student.id, student.id, settingsForm.password);
    setSettingsSuccess('Password updated successfully!');
    setSettingsForm({ password: '', confirmPassword: '' });
  };

  // Filter homework for student's class
  const classHomework = homework.filter(h => h.class === student.class);

  // Filter student scores
  const studentScores = examScores.filter(s => s.studentId === student.id);

  // Filter student attendance
  const studentAttendanceRecord = studentAttendance.filter(a => a.studentId === student.id);
  const presentCount = studentAttendanceRecord.filter(a => a.status === 'Present').length;
  const lateCount = studentAttendanceRecord.filter(a => a.status === 'Late').length;
  const absentCount = studentAttendanceRecord.filter(a => a.status === 'Absent').length;
  const totalDays = studentAttendanceRecord.length;
  const attendanceRate = totalDays > 0 ? ((presentCount + lateCount * 0.5) / totalDays * 100).toFixed(1) : '100';

  // GPA calculation helper
  const getGradeAndPoints = (score) => {
    if (score >= 90) return { grade: 'A', points: 4.0 };
    if (score >= 80) return { grade: 'B', points: 3.0 };
    if (score >= 70) return { grade: 'C', points: 2.0 };
    if (score >= 60) return { grade: 'D', points: 1.0 };
    return { grade: 'F', points: 0.0 };
  };

  const totalPoints = studentScores.reduce((acc, s) => acc + getGradeAndPoints(s.score).points, 0);
  const gpa = studentScores.length > 0 ? (totalPoints / studentScores.length).toFixed(2) : 'N/A';

  const outstandingBalance = student.feesDue - student.feesPaid;

  return (
    <div className="student-dashboard-root">
      {/* Student Profile Summary Header */}
      <div className="glass-card mb-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Student File: {student.name}</h2>
          <p className="text-sm text-muted">Classroom: <span className="font-bold">{student.class}</span> | Student ID: <span className="font-bold">{student.id}</span></p>
        </div>
        
        <nav aria-label="Student dashboard section tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            id="std-tab-summary"
            className={`btn ${activeSubTab === 'summary' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('summary')}
          >
            <Award size={16} /> Summary & Grades
          </button>
          <button 
            id="std-tab-homework"
            className={`btn ${activeSubTab === 'homework' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('homework')}
          >
            <BookOpen size={16} /> Homework ({classHomework.length})
          </button>
          <button 
            id="std-tab-trips"
            className={`btn ${activeSubTab === 'trips' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('trips')}
          >
            <Compass size={16} /> Excursions & Calendar
          </button>
          <button 
            id="std-tab-finance"
            className={`btn ${activeSubTab === 'finance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('finance')}
          >
            <DollarSign size={16} /> Fees Ledger
          </button>
          <button 
            id="std-tab-settings"
            className={`btn ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>
      </div>

      {/* 1. ACADEMIC & ATTENDANCE SUMMARY */}
      {activeSubTab === 'summary' && (
        <section id="std-section-summary" aria-labelledby="std-summary-title">
          <h3 id="std-summary-title" className="visually-hidden">Academic Performance and Attendance</h3>
          
          <div className="grid-cols-3 mb-md">
            <div className="stat-widget">
              <div className="stat-icon-wrapper primary"><Award size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{gpa === 'N/A' ? 'N/A' : `${gpa} GPA`}</span>
                <span className="stat-label">Cumulative GPA</span>
              </div>
            </div>
            <div className="stat-widget">
              <div className="stat-icon-wrapper success"><CheckCircle2 size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{attendanceRate}%</span>
                <span className="stat-label">Attendance Rate</span>
              </div>
            </div>
            <div className="stat-widget">
              <div className="stat-icon-wrapper error"><DollarSign size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">
                  {outstandingBalance === 0 ? 'Clear' : `$${outstandingBalance.toLocaleString()}`}
                </span>
                <span className="stat-label">Outstanding Fees</span>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            {/* Grades breakdown card */}
            <div className="glass-card">
              <h3>Academic Grades Report</h3>
              
              <div className="table-wrapper mt-md">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Assessment Slot</th>
                        <th>Exam Score</th>
                        <th>Computed Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentScores.map((scoreObj) => {
                        const rating = getGradeAndPoints(scoreObj.score);
                        return (
                          <tr key={scoreObj.id}>
                            <td><span className="font-bold">{scoreObj.subject}</span></td>
                            <td>{scoreObj.assessment || 'General'}</td>
                            <td>{scoreObj.score}%</td>
                            <td>
                              <span className={`badge ${rating.grade === 'A' || rating.grade === 'B' ? 'badge-success' : rating.grade === 'C' ? 'badge-info' : 'badge-error'}`}>
                                Grade {rating.grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {studentScores.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No grades recorded in the report card yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>

            {/* Attendance matrix card */}
            <div className="glass-card">
              <h3>Attendance Log & Summary</h3>
              <div className="flex-between mt-md">
                <span className="text-sm">Present: <span className="font-bold" style={{ color: 'var(--color-success)' }}>{presentCount}</span></span>
                <span className="text-sm">Late: <span className="font-bold" style={{ color: 'var(--color-warning)' }}>{lateCount}</span></span>
                <span className="text-sm">Absent: <span className="font-bold" style={{ color: 'var(--color-error)' }}>{absentCount}</span></span>
                <span className="text-sm">Total Logged: <span className="font-bold">{totalDays} days</span></span>
              </div>
              
              <div className="table-wrapper mt-md" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentAttendanceRecord.slice().reverse().map((att) => (
                      <tr key={att.id}>
                        <td>{att.date}</td>
                        <td>
                          <span className={`badge ${att.status === 'Present' ? 'badge-success' : att.status === 'Late' ? 'badge-warning' : 'badge-error'}`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {studentAttendanceRecord.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted">No attendance tracked.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. HOMEWORK BOARD */}
      {activeSubTab === 'homework' && (
        <section id="std-section-homework" aria-labelledby="std-homework-title">
          <h3 id="std-homework-title" className="visually-hidden">Pending Assignments Feed</h3>
          
          <div className="glass-card">
            <h3>Assigned Classroom Homework ({student.class})</h3>
            
            <div className="feed-list mt-md">
              {classHomework.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={40} style={{ color: 'var(--color-text-muted)' }} />
                  <p>Congratulations! No pending homework assigned for your class.</p>
                </div>
              ) : (
                classHomework.map((hw) => (
                  <div className="feed-item" key={hw.id}>
                    <div className="feed-icon"><BookOpen /></div>
                    <div className="feed-content">
                      <div className="flex-between">
                        <span className="font-bold" style={{ fontSize: '1.05rem' }}>{hw.title}</span>
                        <span className="badge badge-info">{hw.subject}</span>
                      </div>
                      <p className="text-sm mt-md">{hw.description || 'No instructions provided.'}</p>
                      <div className="feed-meta">
                        <span>Assigned by: {hw.teacherName}</span>
                        <span>Posted on: {hw.datePosted}</span>
                        <span style={{ color: 'var(--color-error)', fontWeight: '600' }}>Submit by: {hw.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. TRIPS & CLOSING DAYS */}
      {activeSubTab === 'trips' && (
        <section id="std-section-trips" aria-labelledby="std-trips-title">
          <h3 id="std-trips-title" className="visually-hidden">Scheduled Field Trips and Calendar Closures</h3>
          
          <div className="grid-cols-2">
            {/* Excursions */}
            <div className="glass-card">
              <h3>Upcoming School Trips</h3>
              <div className="feed-list mt-md">
                {trips.length === 0 ? (
                  <p className="text-muted">No excursions scheduled at the moment.</p>
                ) : (
                  trips.map((trp) => (
                    <div className="feed-item" key={trp.id}>
                      <div className="feed-icon"><Compass /></div>
                      <div className="feed-content">
                        <div className="flex-between">
                          <span className="font-bold">{trp.title}</span>
                          <span className="badge badge-success">${trp.cost}</span>
                        </div>
                        <p className="text-sm mt-md">{trp.description}</p>
                        <div className="feed-meta">
                          <span>Scheduled Date: <span className="font-bold">{trp.date}</span></span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* School closures */}
            <div className="glass-card">
              <h3>School Closures & Holidays</h3>
              <div className="feed-list mt-md">
                {closingDays.length === 0 ? (
                  <p className="text-muted">No holiday closures listed.</p>
                ) : (
                  closingDays.map((cls) => (
                    <div className="feed-item" key={cls.id}>
                      <div className="feed-icon" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}><Calendar /></div>
                      <div className="feed-content">
                        <span className="font-bold">{cls.title}</span>
                        <p className="text-sm mt-md">{cls.reason}</p>
                        <div className="feed-meta">
                          <span>Dates: {cls.startDate} {cls.endDate && cls.endDate !== cls.startDate ? `to ${cls.endDate}` : ''}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. FINANCIAL LEDGER */}
      {activeSubTab === 'finance' && (
        <section id="std-section-finance" aria-labelledby="std-finance-title">
          <h3 id="std-finance-title" className="visually-hidden">Financial Ledger and Billing Statement</h3>
          
          <div className="grid-cols-3 mb-md">
            <div className="glass-card">
              <span className="text-sm text-muted">Total Annual Tuition</span>
              <div style={{ fontSize: '2rem', fontWeight: '800', marginBlockStart: '5px' }}>
                ${student.feesDue.toLocaleString()}
              </div>
            </div>
            <div className="glass-card">
              <span className="text-sm text-muted">Amount Paid To Date</span>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-success)', marginBlockStart: '5px' }}>
                ${student.feesPaid.toLocaleString()}
              </div>
            </div>
            <div className="glass-card">
              <span className="text-sm text-muted">Remaining Balance Due</span>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: outstandingBalance > 0 ? 'var(--color-error)' : 'var(--color-success)', 
                marginBlockStart: '5px' 
              }}>
                ${outstandingBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-header">
              <h3>Receipt & Payment Transaction History</h3>
              <FileText size={18} className="text-muted" />
            </div>
            
            <div className="table-wrapper mt-md">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt Number</th>
                    <th>Date Paid</th>
                    <th>Payment Method</th>
                    <th className="text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {student.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td><span className="font-bold text-xs">{payment.id}</span></td>
                      <td>{payment.date}</td>
                      <td>{payment.method}</td>
                      <td className="text-right" style={{ fontWeight: '600', color: 'var(--color-success)' }}>
                        +${payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {student.payments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No transactions recorded. Outstanding dues should be paid at the main billing office.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. STUDENT SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <section id="std-section-settings" aria-labelledby="std-settings-title">
          <h3 id="std-settings-title" className="visually-hidden">Student Security Settings</h3>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Student Security Settings</h3>
            <p className="text-sm text-muted mt-xs">Update your student portal password. Admission number remains fixed.</p>

            {settingsSuccess && (
              <div className="badge badge-success mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                {settingsSuccess}
              </div>
            )}
            {settingsError && (
              <div className="badge badge-error mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                {settingsError}
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="mt-md" id="student-settings-form">
              <div className="form-group">
                <label htmlFor="set-std-username">Admission Number (ID)</label>
                <input 
                  type="text" 
                  id="set-std-username" 
                  className="form-control" 
                  disabled
                  value={student.id}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-std-pass">New Password</label>
                <input 
                  type="password" 
                  id="set-std-pass" 
                  className="form-control" 
                  placeholder="Enter new password"
                  required
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-std-pass-confirm">Confirm Password</label>
                <input 
                  type="password" 
                  id="set-std-pass-confirm" 
                  className="form-control" 
                  placeholder="Repeat new password"
                  required
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Security Password
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
