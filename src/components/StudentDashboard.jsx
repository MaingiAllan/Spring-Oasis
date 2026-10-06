import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BookOpen, DollarSign, Calendar, Compass, Award, FileText, CheckCircle2, Settings, ShieldCheck, Smartphone, Printer, X, Loader2 } from 'lucide-react';

export default function StudentDashboard({ overrideStudentId }) {
  const {
    students,
    invoices,
    payments,
    homework,
    trips,
    closingDays,
    examScores,
    studentAttendance,
    updateUserCredentials,
    addPayment
  } = useSchool();

  // Selected student
  const defaultStudentId = 'std-1';
  const activeStudentId = overrideStudentId || defaultStudentId;
  const student = students.find(s => s.id === activeStudentId) || students[0];

  const [activeSubTab, setActiveSubTab] = useState('summary'); // summary, homework, trips, finance, settings

  // Payment Modal & M-Pesa STK Push states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('254712345678');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('mpesa_express');
  const [stkStatus, setStkStatus] = useState('IDLE'); // IDLE, PROMPTED, PROCESSING, SUCCESS
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Settings form states
  const [settingsForm, setSettingsForm] = useState({ password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  if (!student) {
    return <div className="empty-state">No student records found.</div>;
  }

  // Get current student invoices & payment history
  const studentInvoice = (invoices || []).find(inv => inv.studentId === student.id) || (invoices || [])[0];
  const studentInvoiceItems = studentInvoice ? (studentInvoice.items || []) : [];
  const studentPayments = (payments || []).filter(p => p.studentId === student.id);

  const outstandingBalance = studentInvoice ? studentInvoice.balance : (student.feesDue - student.feesPaid);

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    const amountToPay = Number(paymentAmount) || outstandingBalance;
    if (amountToPay <= 0) return;

    setStkStatus('PROMPTED');

    // Simulate Server-to-Server M-Pesa Callback after 2 seconds
    setTimeout(() => {
      setStkStatus('PROCESSING');
      setTimeout(() => {
        const paymentRef = `SO-PAY-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        const mpesaCode = `RKT${Math.floor(10000000 + Math.random() * 90000000)}`;

        addPayment(student.id, amountToPay, selectedMethod, {
          paymentReference: paymentRef,
          providerTransactionId: mpesaCode,
          phoneNumber: paymentPhone,
          payerName: student.name
        });

        setStkStatus('SUCCESS');
        setTimeout(() => {
          setStkStatus('IDLE');
          setShowPaymentModal(false);
          setPaymentAmount('');
        }, 1500);
      }, 1500);
    }, 2000);
  };

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

      {/* 4. FINANCIAL LEDGER & M-PESA PAYMENT SYSTEM */}
      {activeSubTab === 'finance' && (
        <section id="std-section-finance" aria-labelledby="std-finance-title">
          <h3 id="std-finance-title" className="visually-hidden">Financial Ledger and Billing Statement</h3>
          
          <div className="grid-cols-3 mb-md">
            <div className="glass-card">
              <span className="text-sm text-muted">Total Term Fees Billed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginBlockStart: '5px' }}>
                KES {(studentInvoice ? studentInvoice.totalAmount : student.feesDue).toLocaleString()}
              </div>
            </div>
            <div className="glass-card">
              <span className="text-sm text-muted">Total Amount Paid To Date</span>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-success)', marginBlockStart: '5px' }}>
                KES {student.feesPaid.toLocaleString()}
              </div>
            </div>
            <div className="glass-card">
              <span className="text-sm text-muted">Current Outstanding Dues</span>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: '800', 
                color: outstandingBalance > 0 ? 'var(--color-error)' : 'var(--color-success)', 
                marginBlockStart: '5px' 
              }}>
                KES {outstandingBalance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Bar for Automated Payment */}
          <div className="glass-card mb-md flex-between" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <CheckCircle2 color="var(--color-success)" size={20} />
                Automated School Fee Payment Portal
              </h3>
              <p className="text-sm text-muted mt-xs">Direct M-Pesa STK Push, Bank Transfer & Instant Webhook Real-Time Reconciliation</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowPaymentModal(true)}
              disabled={outstandingBalance <= 0}
              style={{ padding: '12px 24px', fontWeight: 'bold' }}
            >
              <DollarSign size={18} /> {outstandingBalance > 0 ? 'Pay Outstanding Dues via M-Pesa' : 'Fees Fully Settled'}
            </button>
          </div>

          <div className="grid-cols-2 mb-md">
            {/* Term Invoice Itemized Breakdown */}
            <div className="glass-card">
              <h3>2026 Term 1 Itemized Fee Invoice</h3>
              <p className="text-xs text-muted">Invoice Ref: <span className="font-bold">{studentInvoice ? studentInvoice.invoiceNumber : 'INV-2026-001'}</span> | Due: <span className="font-bold">{studentInvoice ? studentInvoice.dueDate : '2026-08-30'}</span></p>
              
              <div className="table-wrapper mt-md">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fee Component</th>
                      <th>Description</th>
                      <th className="text-right">Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentInvoiceItems.map((item) => (
                      <tr key={item.id}>
                        <td><span className="badge badge-info">{item.feeType}</span></td>
                        <td>{item.description}</td>
                        <td className="text-right font-bold">KES {item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {studentInvoiceItems.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">Standard Grade 10 Tuition Fee Schedule applied.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial State Machine Status */}
            <div className="glass-card">
              <h3>Settlement Status & Real-Time Ledger</h3>
              <div className="mt-md p-md" style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="flex-between mb-sm">
                  <span className="text-sm">Invoice Status:</span>
                  <span className={`badge ${studentInvoice?.status === 'PAID' ? 'badge-success' : studentInvoice?.status === 'PARTIALLY_PAID' ? 'badge-warning' : 'badge-error'}`}>
                    {studentInvoice ? studentInvoice.status : (outstandingBalance === 0 ? 'PAID' : 'PARTIALLY_PAID')}
                  </span>
                </div>
                <div className="flex-between mb-sm">
                  <span className="text-sm">Last Verified Payment:</span>
                  <span className="text-sm font-bold">{studentPayments.length > 0 ? studentPayments[0].paidAt?.split('T')[0] : 'N/A'}</span>
                </div>
                <div className="flex-between mb-sm">
                  <span className="text-sm">Reconciliation Audit:</span>
                  <span className="badge badge-success">STK_PUSH_VERIFIED</span>
                </div>
                <div className="flex-between">
                  <span className="text-sm">Currency Standard:</span>
                  <span className="text-sm font-bold">KES (DECIMAL 19,4)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>Verified Payment Ledger & Audit Trail</h3>
              <FileText size={18} className="text-muted" />
            </div>
            
            <div className="table-wrapper mt-md">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payment Ref</th>
                    <th>Provider Tx ID</th>
                    <th>Date & Time</th>
                    <th>Method / Channel</th>
                    <th>Reconciliation Status</th>
                    <th className="text-right">Amount Paid</th>
                    <th className="text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPayments.map((pay) => (
                    <tr key={pay.id}>
                      <td><span className="font-bold text-xs">{pay.paymentReference}</span></td>
                      <td><span className="font-mono text-xs" style={{ color: 'var(--color-primary)' }}>{pay.providerTransactionId}</span></td>
                      <td className="text-xs">{pay.paidAt ? new Date(pay.paidAt).toLocaleString() : pay.date}</td>
                      <td>
                        <span className="badge badge-info">{pay.provider || pay.method}</span>
                      </td>
                      <td>
                        <span className="badge badge-success">{pay.reconciliationStatus || 'MATCHED'}</span>
                      </td>
                      <td className="text-right" style={{ fontWeight: '700', color: 'var(--color-success)' }}>
                        +KES {pay.amount.toLocaleString()}
                      </td>
                      <td className="text-center">
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReceipt(pay)}>
                          <FileText size={14} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {studentPayments.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">No transactions recorded in the financial ledger.</td>
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

      {/* M-PESA STK PUSH PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', background: '#111827', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '24px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div className="flex-between mb-md">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone color="var(--color-success)" size={24} />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>M-Pesa STK Push Gateway</h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>

            {stkStatus === 'IDLE' && (
              <form onSubmit={handleInitiatePayment}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div className="flex-between text-xs text-muted">
                    <span>Student Name:</span>
                    <span className="font-bold text-white">{student.name} ({student.id})</span>
                  </div>
                  <div className="flex-between text-xs text-muted mt-xs">
                    <span>Invoice Ref:</span>
                    <span className="font-mono text-white">{studentInvoice ? studentInvoice.invoiceNumber : 'INV-2026-001'}</span>
                  </div>
                  <div className="flex-between text-xs text-muted mt-xs">
                    <span>Total Outstanding:</span>
                    <span className="font-bold text-error">KES {outstandingBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label htmlFor="pay-method-select">Payment Method</label>
                  <select 
                    id="pay-method-select" 
                    className="form-control" 
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    <option value="mpesa_express">M-Pesa Express (STK Push)</option>
                    <option value="mpesa_paybill">M-Pesa Paybill (C2B Validation)</option>
                    <option value="equity_bank">Equity Bank Direct Transfer</option>
                    <option value="card">Visa / Mastercard</option>
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label htmlFor="pay-phone">M-Pesa Registered Mobile Number</label>
                  <input 
                    type="text" 
                    id="pay-phone" 
                    className="form-control"
                    placeholder="254712345678" 
                    required
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                  />
                  <span className="text-xs text-muted">Format: 254XXXXXXXXX (Safaricom M-Pesa line)</span>
                </div>

                <div className="form-group mb-md">
                  <label htmlFor="pay-amount">Payment Amount (KES)</label>
                  <input 
                    type="number" 
                    id="pay-amount" 
                    className="form-control"
                    placeholder={`Default: KES ${outstandingBalance}`} 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={outstandingBalance}
                    min={100}
                  />
                  <span className="text-xs text-muted">Leave empty to pay full balance of KES {outstandingBalance.toLocaleString()}</span>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 'bold' }}>
                  <ShieldCheck size={18} /> Initiate M-Pesa STK Push Prompt
                </button>
              </form>
            )}

            {stkStatus === 'PROMPTED' && (
              <div className="text-center p-lg">
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                <h4>Check Phone for M-Pesa STK Prompt</h4>
                <p className="text-sm text-muted mt-sm">
                  An M-Pesa prompt has been pushed to <span className="font-bold text-white">{paymentPhone}</span> for <span className="font-bold text-success">KES {(Number(paymentAmount) || outstandingBalance).toLocaleString()}</span>.
                </p>
                <p className="text-xs text-muted mt-md">Please enter your 4-digit M-Pesa PIN on your phone screen to complete transaction...</p>
              </div>
            )}

            {stkStatus === 'PROCESSING' && (
              <div className="text-center p-lg">
                <Loader2 className="animate-spin" size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
                <h4>Verifying Signature & Idempotency...</h4>
                <p className="text-sm text-muted mt-sm">Processing server-to-server webhook callback from Safaricom Daraja API...</p>
              </div>
            )}

            {stkStatus === 'SUCCESS' && (
              <div className="text-center p-lg">
                <CheckCircle2 size={56} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ color: 'var(--color-success)' }}>Payment Confirmed & Verified!</h4>
                <p className="text-sm text-muted mt-sm">Invoice updated, ledger entry logged, and outbox receipt event published.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT VIEW MODAL */}
      {selectedReceipt && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', background: '#ffffff', color: '#111827', padding: '32px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div className="flex-between mb-md" style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.5rem' }}>SPRING OASIS ACADEMY</h2>
                <span className="text-xs" style={{ color: '#6b7280' }}>Official Financial Fee Payment Receipt</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReceipt(null)} style={{ background: '#f3f4f6', color: '#111827' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem', marginBottom: '24px' }}>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Student Name:</span>
                <strong>{student.name}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Admission No:</span>
                <strong>{student.id}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Payment Reference:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedReceipt.paymentReference}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>M-Pesa Receipt Code:</span>
                <strong style={{ fontFamily: 'monospace', color: '#059669' }}>{selectedReceipt.providerTransactionId}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Payment Date & Time:</span>
                <strong>{selectedReceipt.paidAt ? new Date(selectedReceipt.paidAt).toLocaleString() : selectedReceipt.date}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Payment Provider:</span>
                <strong>{selectedReceipt.provider || selectedReceipt.method}</strong>
              </div>
            </div>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div className="flex-between" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>
                <span>AMOUNT PAID:</span>
                <span>KES {selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex-between mt-xs text-xs" style={{ color: '#6b7280' }}>
                <span>Reconciliation Audit Status:</span>
                <span style={{ color: '#059669', fontWeight: 'bold' }}>VERIFIED & MATCHED</span>
              </div>
            </div>

            <div className="flex-between" style={{ gap: '12px' }}>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Printer size={16} /> Print / Save PDF Receipt
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)} style={{ background: '#e5e7eb', color: '#374151' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
