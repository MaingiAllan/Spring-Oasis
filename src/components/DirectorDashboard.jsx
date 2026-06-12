import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users, DollarSign, Calendar, Compass, Plus,
  CreditCard, Award, Eye, Settings, CheckCircle2,
  Edit, Trash2
} from 'lucide-react';

// Sub-component wrapper to let the Director view pages of other roles
import TeacherDashboard from './TeacherDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import StudentDashboard from './StudentDashboard';

export default function DirectorDashboard() {
  const {
    students,
    trips,
    closingDays,
    examScores,
    addTrip,
    addClosingDay,
    addPayment,
    updateStudentFees,
    currentUser,
    admitStudent,
    admitTeacher,
    admitEmployee,
    updateUserCredentials,
    updateTrip,
    deleteTrip,
    updateClosingDay,
    deleteClosingDay
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, admissions, trips-closures, fees-payments, settings, view-pages

  // States for forms
  const [tripForm, setTripForm] = useState({ title: '', date: '', cost: '', description: '' });
  const [closingForm, setClosingForm] = useState({ title: '', startDate: '', endDate: '', reason: '' });
  const [paymentForm, setPaymentForm] = useState({ studentId: '', amount: '', method: 'Bank Transfer' });
  const [feeForm, setFeeForm] = useState({ studentId: '', feesDue: '' });

  // Admissions Form States
  const [admStudent, setAdmStudent] = useState({ id: '', name: '', class: 'Grade 10-A', feesDue: '5000', password: 'password' });
  const [admTeacher, setAdmTeacher] = useState({ name: '', subject: 'Mathematics', class: 'Grade 10-A', username: '', password: 'password' });
  const [admEmployee, setAdmEmployee] = useState({ name: '', role: 'Kitchen Supervisor', username: '', password: 'password' });
  const [admissionSuccess, setAdmissionSuccess] = useState(null);
  const [admissionError, setAdmissionError] = useState(null);

  // Settings Form States
  const [settingsForm, setSettingsForm] = useState({ username: currentUser?.username || 'director', password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  // Success states for toast cards
  const [tripSuccess, setTripSuccess] = useState(null);
  const [closingSuccess, setClosingSuccess] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [feeSuccess, setFeeSuccess] = useState(null);

  // Page Simulation states
  const [simulatedRole, setSimulatedRole] = useState('teacher'); // teacher, employee, student
  const [simulatedStudentId, setSimulatedStudentId] = useState(students[0]?.id || '');

  // Trip/Closure Edit/Delete States
  const [tripClosureTab, setTripClosureTab] = useState('upcoming');
  const [editingTrip, setEditingTrip] = useState(null);
  const [editingClosure, setEditingClosure] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Calculate stats
  const totalFeesDue = students.reduce((acc, s) => acc + s.feesDue, 0);
  const totalFeesPaid = students.reduce((acc, s) => acc + s.feesPaid, 0);
  const pendingFees = totalFeesDue - totalFeesPaid;
  const totalTrips = trips.length;

  // Get unique list of subjects from scores
  const subjects = Array.from(new Set(examScores.map(s => s.subject)));
  if (subjects.length === 0) subjects.push('Mathematics', 'Science', 'English Literature');

  // Computed filtered lists for trips and closures
  const upcomingTrips = trips.filter(trip => new Date(trip.date) >= new Date());
  const pastTrips = trips.filter(trip => new Date(trip.date) < new Date());
  const upcomingClosures = closingDays.filter(closure => new Date(closure.startDate) >= new Date());
  const pastClosures = closingDays.filter(closure => new Date(closure.startDate) < new Date());

  // GPA calculation helper
  const getGradeAndPoints = (score) => {
    if (score >= 90) return { grade: 'A', points: 4.0 };
    if (score >= 80) return { grade: 'B', points: 3.0 };
    if (score >= 70) return { grade: 'C', points: 2.0 };
    if (score >= 60) return { grade: 'D', points: 1.0 };
    return { grade: 'F', points: 0.0 };
  };

  const calculateStudentGPA = (studentId) => {
    const studentScores = examScores.filter(s => s.studentId === studentId);
    if (studentScores.length === 0) return 'N/A';
    const totalPoints = studentScores.reduce((acc, s) => acc + getGradeAndPoints(s.score).points, 0);
    return (totalPoints / studentScores.length).toFixed(2);
  };

  const handleAdmStudentSubmit = (e) => {
    e.preventDefault();
    setAdmissionError(null);
    setAdmissionSuccess(null);
    try {
      admitStudent(admStudent);
      setAdmissionSuccess(`Student "${admStudent.name}" enrolled successfully with Admission Number "${admStudent.id}"!`);
      setAdmStudent({ id: '', name: '', class: 'Grade 10-A', feesDue: '5000', password: 'password' });
    } catch (err) {
      setAdmissionError(err.message);
    }
  };

  const handleAdmTeacherSubmit = (e) => {
    e.preventDefault();
    setAdmissionError(null);
    setAdmissionSuccess(null);
    try {
      admitTeacher(admTeacher);
      setAdmissionSuccess(`Teacher "${admTeacher.name}" admitted successfully! Username: "${admTeacher.username}".`);
      setAdmTeacher({ name: '', subject: 'Mathematics', class: 'Grade 10-A', username: '', password: 'password' });
    } catch (err) {
      setAdmissionError(err.message);
    }
  };

  const handleAdmEmployeeSubmit = (e) => {
    e.preventDefault();
    setAdmissionError(null);
    setAdmissionSuccess(null);
    try {
      admitEmployee(admEmployee);
      setAdmissionSuccess(`Staff member "${admEmployee.name}" admitted successfully! Username: "${admEmployee.username}".`);
      setAdmEmployee({ name: '', role: 'Kitchen Supervisor', username: '', password: 'password' });
    } catch (err) {
      setAdmissionError(err.message);
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    if (!settingsForm.password) {
      setSettingsError('Password is required to apply changes.');
      return;
    }
    if (settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsError('Passwords do not match.');
      return;
    }
    updateUserCredentials('director', currentUser.id, settingsForm.username, settingsForm.password);
    setSettingsSuccess('Director credentials updated successfully!');
    setSettingsForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  // Trip/Closure Edit/Delete Handlers
  const openEditTripModal = (trip) => {
    setEditingTrip({ ...trip });
  };

  const openEditClosureModal = (closure) => {
    setEditingClosure({ ...closure });
  };

  const handleUpdateTrip = (e) => {
    e.preventDefault();
    if (updateTrip) {
      updateTrip(editingTrip);
    }
    setEditingTrip(null);
    setTripSuccess('Trip updated successfully!');
    setTimeout(() => setTripSuccess(null), 3000);
  };

  const handleUpdateClosure = (e) => {
    e.preventDefault();
    if (updateClosingDay) {
      updateClosingDay(editingClosure);
    }
    setEditingClosure(null);
    setClosingSuccess('Closure updated successfully!');
    setTimeout(() => setClosingSuccess(null), 3000);
  };

  const confirmDeleteTrip = (tripId) => {
    setDeleteConfirm({ type: 'trip', id: tripId });
  };

  const confirmDeleteClosure = (closureId) => {
    setDeleteConfirm({ type: 'closure', id: closureId });
  };

  const handleDeleteItem = () => {
    if (deleteConfirm.type === 'trip') {
      if (deleteTrip) {
        deleteTrip(deleteConfirm.id);
      }
    } else {
      if (deleteClosingDay) {
        deleteClosingDay(deleteConfirm.id);
      }
    }
    setDeleteConfirm(null);
    setTripSuccess(`${deleteConfirm?.type === 'trip' ? 'Trip' : 'Closure'} deleted successfully!`);
    setTimeout(() => setTripSuccess(null), 3000);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const themeClass = document.documentElement.getAttribute('data-theme') || 'dark';

    let subjectsHeader = subjects.map(s => `<th>${s}</th>`).join('');
    let rows = students.map(student => {
      const studentGPA = calculateStudentGPA(student.id);
      let scoreCols = subjects.map(subject => {
        const scores = examScores.filter(s => s.studentId === student.id && s.subject === subject);
        if (scores.length === 0) return '<td>Not Graded<\/td>';
        return `<td>${scores.map(s => `<strong>${s.assessment || 'General'}</strong>: ${s.score}%`).join('<br/>')}<\/td>`;
      }).join('');
      return `
        <tr>
          <td><strong>${student.name}</strong><br/><small>ID: ${student.id}</small><\/td>
          <td>${student.class}<\/td>
          ${scoreCols}
          <td><strong>${studentGPA === 'N/A' ? 'N/A' : `${studentGPA} GPA`}</strong><\/td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html data-theme="${themeClass}">
      <head>
        <title>SpringOasis - Grades Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px;
            background-color: #fff;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { margin: 0; font-size: 24px; color: #111; text-transform: uppercase; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          .date { text-align: right; font-size: 14px; color: #666; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 10px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #111;
          }
          tr:nth-child(even) { background-color: #fafafa; }
          .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 6px;
            font-size: 14px;
          }
          .signature-line {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .sig {
            border-top: 1px solid #999;
            width: 200px;
            text-align: center;
            padding-top: 8px;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            @page { size: landscape; margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>SpringOasis Academy</h1>
            <p>Official Academic Grades Ledger</p>
          </div>
          <div class="date">
            <strong>Generated:</strong> ${new Date().toLocaleDateString()}<br/>
            <strong>Term:</strong> Spring 2026<br/>
            <strong>Status:</strong> Sealed & Certified
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              ${subjectsHeader}
              <th>GPA</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="summary">
          <strong>Summary statistics:</strong> Total Enrolled Students: ${students.length} | Academic Subjects Tracked: ${subjects.length}
        </div>

        <div class="signature-line">
          <div class="sig">Advising Registrar Signature</div>
          <div class="sig">Headmaster of SpringOasis Signature</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handle Form Submissions
  const handleTripSubmit = (e) => {
    e.preventDefault();
    if (!tripForm.title || !tripForm.date || !tripForm.cost) return;
    addTrip({
      title: tripForm.title,
      date: tripForm.date,
      cost: Number(tripForm.cost),
      description: tripForm.description
    });
    setTripSuccess(`Trip to "${tripForm.title}" scheduled successfully for ${tripForm.date}!`);
    setTripForm({ title: '', date: '', cost: '', description: '' });
    setTimeout(() => setTripSuccess(null), 8000);
  };

  const handleClosingSubmit = (e) => {
    e.preventDefault();
    if (!closingForm.title || !closingForm.startDate || !closingForm.reason) return;
    addClosingDay({
      title: closingForm.title,
      startDate: closingForm.startDate,
      endDate: closingForm.endDate || closingForm.startDate,
      reason: closingForm.reason
    });
    setClosingSuccess(`School closure for "${closingForm.title}" scheduled on ${closingForm.startDate}!`);
    setClosingForm({ title: '', startDate: '', endDate: '', reason: '' });
    setTimeout(() => setClosingSuccess(null), 8000);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount || Number(paymentForm.amount) <= 0) return;

    const student = students.find(s => s.id === paymentForm.studentId);
    if (!student) return;

    addPayment(paymentForm.studentId, Number(paymentForm.amount), paymentForm.method);

    // Auto-calculate the remaining balance after deduction
    const nextPaid = student.feesPaid + Number(paymentForm.amount);
    const balanceRemaining = student.feesDue - nextPaid;

    setPaymentSuccess({
      studentName: student.name,
      amount: Number(paymentForm.amount),
      method: paymentForm.method,
      receiptId: `REC-${Date.now().toString().slice(-6)}`,
      balanceRemaining
    });

    setPaymentForm({ studentId: '', amount: '', method: 'Bank Transfer' });
    setTimeout(() => setPaymentSuccess(null), 12000);
  };

  const handleFeeSubmit = (e) => {
    e.preventDefault();
    if (!feeForm.studentId || !feeForm.feesDue || Number(feeForm.feesDue) < 0) return;

    const student = students.find(s => s.id === feeForm.studentId);
    if (!student) return;

    updateStudentFees(feeForm.studentId, Number(feeForm.feesDue));

    setFeeSuccess({
      studentName: student.name,
      feesDue: Number(feeForm.feesDue)
    });

    setFeeForm({ studentId: '', feesDue: '' });
    setTimeout(() => setFeeSuccess(null), 12000);
  };

  return (
    <div className="director-dashboard-root">
      {/* Sub tabs navigation */}
      <div className="glass-card mb-md">
        <nav aria-label="Director dashboard section tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="dir-tab-overview"
            className={`btn ${activeSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('overview')}
          >
            <Award size={16} /> Overview & Grades
          </button>
          <button
            id="dir-tab-admissions"
            className={`btn ${activeSubTab === 'admissions' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('admissions')}
          >
            <Users size={16} /> Admissions Console
          </button>
          <button
            id="dir-tab-trips"
            className={`btn ${activeSubTab === 'trips-closures' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('trips-closures')}
          >
            <Compass size={16} /> Trips & Closures
          </button>
          <button
            id="dir-tab-fees"
            className={`btn ${activeSubTab === 'fees-payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('fees-payments')}
          >
            <CreditCard size={16} /> Fees & Payments
          </button>
          <button
            id="dir-tab-simulation"
            className={`btn ${activeSubTab === 'view-pages' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('view-pages')}
          >
            <Eye size={16} /> Simulate Role Pages
          </button>
          <button
            id="dir-tab-settings"
            className={`btn ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>
      </div>

      {/* OVERVIEW & STUDENT GRADES */}
      {activeSubTab === 'overview' && (
        <section id="dir-section-overview" aria-labelledby="dir-overview-title">
          <h2 id="dir-overview-title" className="visually-hidden">Academic Performance & Analytics</h2>

          <div className="grid-cols-4 mb-md">
            <div className="stat-widget">
              <div className="stat-icon-wrapper primary"><Users size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{students.length}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>
            <div className="stat-widget">
              <div className="stat-icon-wrapper accent"><Calendar size={24} /></div>
              <div className="stat-content">
                <span className="stat-value">{totalTrips}</span>
                <span className="stat-label font-bold">Upcoming Trips</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Academic Grades Matrix</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={handleExportPDF}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--color-primary)' }}
                >
                  <Award size={14} /> Export Grades (PDF)
                </button>
                <span className="badge badge-info">All Registered Students</span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Class</th>
                    {subjects.map((sub) => (
                      <th key={sub}>{sub}</th>
                    ))}
                    <th>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const studentGPA = calculateStudentGPA(student.id);
                    return (
                      <tr key={student.id}>
                        <td><span className="font-bold">{student.name}</span></td>
                        <td>{student.class}</td>
                        {subjects.map((subject) => {
                          const scores = examScores.filter(
                            (s) => s.studentId === student.id && s.subject === subject
                          );
                          return (
                            <td key={subject}>
                              {scores.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {scores.map((s) => {
                                    const rating = getGradeAndPoints(s.score);
                                    return (
                                      <div key={s.id} className="text-xs" style={{ whiteSpace: 'nowrap' }}>
                                        <span className="font-bold">{s.assessment || 'General'}:</span> {s.score}% ({rating.grade})
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted text-xs">Not Graded</span>
                              )}
                            </td>
                          );
                        })}
                        <td>
                          <span className={`badge ${studentGPA === 'N/A' ? 'badge-warning' : Number(studentGPA) >= 3.0 ? 'badge-success' : 'badge-info'}`}>
                            {studentGPA === 'N/A' ? 'N/A' : `${studentGPA} GPA`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TRIPS & CLOSURES MANAGEMENT */}
      {activeSubTab === 'trips-closures' && (
        <section id="dir-section-trips" aria-labelledby="dir-trips-title">
          <h2 id="dir-trips-title" className="visually-hidden">Trips & Closing Days Configuration</h2>

          <div className="grid-cols-2">
            {/* Trips Posting Form */}
            <div className="glass-card">
              <h3>Schedule School Trip</h3>
              {tripSuccess && (
                <div className="badge badge-success mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center', boxSizing: 'border-box' }}>
                  {tripSuccess}
                </div>
              )}
              <form onSubmit={handleTripSubmit} className="mt-md" id="post-trip-form">
                <div className="form-group">
                  <label htmlFor="trip-title">Trip Destination / Title *</label>
                  <input
                    type="text"
                    id="trip-title"
                    className="form-control"
                    placeholder="e.g. Botanical Gardens Excursion"
                    required
                    value={tripForm.title}
                    onChange={(e) => setTripForm({ ...tripForm, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="trip-date">Scheduled Date *</label>
                    <input
                      type="date"
                      id="trip-date"
                      className="form-control"
                      required
                      value={tripForm.date}
                      onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="trip-cost">Cost per Student (KES) *</label>
                    <input
                      type="number"
                      id="trip-cost"
                      min="0"
                      className="form-control"
                      placeholder="e.g. 3500"
                      required
                      value={tripForm.cost}
                      onChange={(e) => setTripForm({ ...tripForm, cost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="trip-desc">Trip Description</label>
                  <textarea
                    id="trip-desc"
                    className="form-control"
                    placeholder="Provide itinerary and details..."
                    value={tripForm.description}
                    onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Broadcast Trip to Students
                </button>
              </form>
            </div>

            {/* School closures Form */}
            <div className="glass-card">
              <h3>Post School Closing Days</h3>
              {closingSuccess && (
                <div className="badge badge-success mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center', boxSizing: 'border-box' }}>
                  {closingSuccess}
                </div>
              )}
              <form onSubmit={handleClosingSubmit} className="mt-md" id="post-closure-form">
                <div className="form-group">
                  <label htmlFor="closing-title">Holiday / Closure Title *</label>
                  <input
                    type="text"
                    id="closing-title"
                    className="form-control"
                    placeholder="e.g. Winter Break"
                    required
                    value={closingForm.title}
                    onChange={(e) => setClosingForm({ ...closingForm, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="closing-start">Start Date *</label>
                    <input
                      type="date"
                      id="closing-start"
                      className="form-control"
                      required
                      value={closingForm.startDate}
                      onChange={(e) => setClosingForm({ ...closingForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="closing-end">End Date (Optional)</label>
                    <input
                      type="date"
                      id="closing-end"
                      className="form-control"
                      value={closingForm.endDate}
                      onChange={(e) => setClosingForm({ ...closingForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="closing-reason">Reason for Closure *</label>
                  <textarea
                    id="closing-reason"
                    className="form-control"
                    placeholder="Provide holiday details, instructions, or emergency notes..."
                    required
                    value={closingForm.reason}
                    onChange={(e) => setClosingForm({ ...closingForm, reason: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Schedule School Closure
                </button>
              </form>
            </div>
          </div>

          {/* Tabs for Active/Past Events */}
          <div className="tabs-container mt-lg">
            <div className="tabs-header">
              <button
                className={`tab-btn ${tripClosureTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setTripClosureTab('upcoming')}
              >
                Upcoming Events
              </button>
              <button
                className={`tab-btn ${tripClosureTab === 'past' ? 'active' : ''}`}
                onClick={() => setTripClosureTab('past')}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          {tripClosureTab === 'upcoming' && (
            <div className="grid-cols-2 mt-lg">
              <div className="glass-card">
                <h4>Upcoming Trips</h4>
                <div className="feed-list mt-md">
                  {upcomingTrips.length === 0 ? (
                    <p className="text-muted">No upcoming trips scheduled.</p>
                  ) : (
                    upcomingTrips.map((trp) => (
                      <div className="feed-item" key={trp.id}>
                        <div className="feed-icon"><Compass /></div>
                        <div className="feed-content">
                          <div className="flex-between">
                            <span className="font-bold">{trp.title}</span>
                            <span className="badge badge-success">KES {trp.cost}</span>
                          </div>
                          <p className="text-sm mt-md">{trp.description || 'No description provided.'}</p>
                          <div className="feed-meta">
                            <span>Scheduled: {trp.date}</span>
                            <span>Posted: {trp.postedDate}</span>
                          </div>
                          <div className="feed-actions mt-md">
                            <button
                              className="btn-icon"
                              onClick={() => openEditTripModal(trp)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon error"
                              onClick={() => confirmDeleteTrip(trp.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-card">
                <h4>Upcoming Closures</h4>
                <div className="feed-list mt-md">
                  {upcomingClosures.length === 0 ? (
                    <p className="text-muted">No upcoming school closures.</p>
                  ) : (
                    upcomingClosures.map((cls) => (
                      <div className="feed-item" key={cls.id}>
                        <div className="feed-icon" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}><Calendar /></div>
                        <div className="feed-content">
                          <div className="flex-between">
                            <span className="font-bold">{cls.title}</span>
                          </div>
                          <p className="text-sm mt-md">{cls.reason}</p>
                          <div className="feed-meta">
                            <span>Duration: {cls.startDate} {cls.endDate && cls.endDate !== cls.startDate ? `to ${cls.endDate}` : ''}</span>
                          </div>
                          <div className="feed-actions mt-md">
                            <button
                              className="btn-icon"
                              onClick={() => openEditClosureModal(cls)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon error"
                              onClick={() => confirmDeleteClosure(cls.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Past Events (with edit/delete enabled for directors) */}
          {tripClosureTab === 'past' && (
            <div className="grid-cols-2 mt-lg">
              <div className="glass-card">
                <h4>Past Trips</h4>
                <div className="feed-list mt-md">
                  {pastTrips.length === 0 ? (
                    <p className="text-muted">No past trips.</p>
                  ) : (
                    pastTrips.map((trp) => (
                      <div className="feed-item" key={trp.id}>
                        <div className="feed-icon"><Compass /></div>
                        <div className="feed-content">
                          <div className="flex-between">
                            <span className="font-bold">{trp.title}</span>
                            <span className="badge badge-muted">KES {trp.cost}</span>
                          </div>
                          <p className="text-sm mt-md">{trp.description || 'No description provided.'}</p>
                          <div className="feed-meta">
                            <span>Date: {trp.date}</span>
                            <span>Posted: {trp.postedDate}</span>
                          </div>
                          <div className="feed-actions mt-md">
                            <button
                              className="btn-icon"
                              onClick={() => openEditTripModal(trp)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon error"
                              onClick={() => confirmDeleteTrip(trp.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-card">
                <h4>Past Closures</h4>
                <div className="feed-list mt-md">
                  {pastClosures.length === 0 ? (
                    <p className="text-muted">No past school closures.</p>
                  ) : (
                    pastClosures.map((cls) => (
                      <div className="feed-item" key={cls.id}>
                        <div className="feed-icon" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}><Calendar /></div>
                        <div className="feed-content">
                          <div className="flex-between">
                            <span className="font-bold">{cls.title}</span>
                          </div>
                          <p className="text-sm mt-md">{cls.reason}</p>
                          <div className="feed-meta">
                            <span>Duration: {cls.startDate} {cls.endDate && cls.endDate !== cls.startDate ? `to ${cls.endDate}` : ''}</span>
                          </div>
                          <div className="feed-actions mt-md">
                            <button
                              className="btn-icon"
                              onClick={() => openEditClosureModal(cls)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon error"
                              onClick={() => confirmDeleteClosure(cls.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit Trip Modal */}
          {editingTrip && (
            <div className="modal-overlay" onClick={() => setEditingTrip(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Trip</h3>
                <form onSubmit={handleUpdateTrip}>
                  <div className="form-group">
                    <label>Destination / Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingTrip.title}
                      onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editingTrip.date}
                        onChange={(e) => setEditingTrip({ ...editingTrip, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Cost (KES)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingTrip.cost}
                        onChange={(e) => setEditingTrip({ ...editingTrip, cost: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      value={editingTrip.description}
                      onChange={(e) => setEditingTrip({ ...editingTrip, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingTrip(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Closure Modal */}
          {editingClosure && (
            <div className="modal-overlay" onClick={() => setEditingClosure(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Closure</h3>
                <form onSubmit={handleUpdateClosure}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingClosure.title}
                      onChange={(e) => setEditingClosure({ ...editingClosure, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editingClosure.startDate}
                        onChange={(e) => setEditingClosure({ ...editingClosure, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editingClosure.endDate || ''}
                        onChange={(e) => setEditingClosure({ ...editingClosure, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <textarea
                      className="form-control"
                      value={editingClosure.reason}
                      onChange={(e) => setEditingClosure({ ...editingClosure, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingClosure(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDeleteItem}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* FEES & PAYMENTS MANAGEMENT */}
      {activeSubTab === 'fees-payments' && (
        <section id="dir-section-fees" aria-labelledby="dir-fees-title">
          <h2 id="dir-fees-title" className="visually-hidden">Fees, Payments and Financial Panel</h2>

          <div className="grid-cols-2">
            {/* Record Student Payment */}
            <div className="glass-card">
              <h3>Record Student Payment</h3>
              {paymentSuccess && (
                <div className="glass-card mt-md" style={{
                  borderColor: 'var(--color-success)',
                  backgroundColor: 'var(--color-success-light)',
                  padding: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <div className="flex-gap" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                    <CheckCircle2 size={18} /> Receipt Acknowledged!
                  </div>
                  <p className="text-sm mt-xs" style={{ color: 'var(--color-text-primary)' }}>
                    Successfully captured payment of <strong>KES {paymentSuccess.amount}</strong> for <strong>{paymentSuccess.studentName}</strong> via {paymentSuccess.method}.
                  </p>
                  <p className="text-xs text-muted mt-xs">
                    Receipt ID: <strong>{paymentSuccess.receiptId}</strong> | Balance outstanding: <strong>KES {paymentSuccess.balanceRemaining}</strong> (Deducted from pending ledger automatically).
                  </p>
                </div>
              )}
              <form onSubmit={handlePaymentSubmit} className="mt-md" id="record-payment-form">
                <div className="form-group">
                  <label htmlFor="pay-student">Select Student *</label>
                  <select
                    id="pay-student"
                    className="form-control"
                    required
                    value={paymentForm.studentId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) - Bal: KES {s.feesDue - s.feesPaid}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pay-amount">Payment Amount (KES) *</label>
                    <input
                      type="number"
                      id="pay-amount"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 5000"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pay-method">Payment Method *</label>
                    <select
                      id="pay-method"
                      className="form-control"
                      required
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="M-Pesa">M-Pesa</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <CreditCard size={18} /> Log Payment Transaction
                </button>
              </form>
            </div>

            {/* Set Student Tuition Fees */}
            <div className="glass-card">
              <h3>Set Student Tuition Fees</h3>
              {feeSuccess && (
                <div className="glass-card mt-md" style={{
                  borderColor: 'var(--color-info)',
                  backgroundColor: 'var(--color-info-light)',
                  padding: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <div className="flex-gap" style={{ color: 'var(--color-info)', fontWeight: 'bold' }}>
                    <CheckCircle2 size={18} /> Billing Updated!
                  </div>
                  <p className="text-sm mt-xs" style={{ color: 'var(--color-text-primary)' }}>
                    Annual tuition for <strong>{feeSuccess.studentName}</strong> has been adjusted to <strong>KES {feeSuccess.feesDue.toLocaleString()}</strong>.
                  </p>
                </div>
              )}
              <form onSubmit={handleFeeSubmit} className="mt-md" id="set-fees-form">
                <div className="form-group">
                  <label htmlFor="fee-student">Select Student *</label>
                  <select
                    id="fee-student"
                    className="form-control"
                    required
                    value={feeForm.studentId}
                    onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) - Current Due: KES {s.feesDue}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="fee-amount">New Annual Fees Amount (KES) *</label>
                  <input
                    type="number"
                    id="fee-amount"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 60000"
                    required
                    value={feeForm.feesDue}
                    onChange={(e) => setFeeForm({ ...feeForm, feesDue: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--color-primary)' }}>
                  <Settings size={18} /> Update Tuition Billing
                </button>
              </form>
            </div>
          </div>

          {/* Student Fees Ledger Overview */}
          <div className="glass-card mt-lg">
            <h4>Billing Ledger Summary</h4>
            <div className="table-wrapper mt-md">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Annual Fees</th>
                    <th>Amount Paid</th>
                    <th>Outstanding Due</th>
                    <th>Payments Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const balance = student.feesDue - student.feesPaid;
                    return (
                      <tr key={student.id}>
                        <td><span className="font-bold">{student.name}</span></td>
                        <td>{student.class}</td>
                        <td>KES {student.feesDue.toLocaleString()}</td>
                        <td>
                          <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                            KES {student.feesPaid.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${balance === 0 ? 'badge-success' : 'badge-error'}`}>
                            {balance === 0 ? 'Fully Paid' : `KES ${balance.toLocaleString()}`}
                          </span>
                        </td>
                        <td>
                          {student.payments.length === 0 ? (
                            <span className="text-muted text-xs">No payments</span>
                          ) : (
                            <ul style={{ listStyle: 'none', fontSize: '0.8rem', padding: 0 }}>
                              {student.payments.map((p) => (
                                <li key={p.id} className="text-muted">
                                  KES {p.amount} on {p.date} ({p.method})
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ADMISSIONS PORTAL */}
      {activeSubTab === 'admissions' && (
        <section id="dir-section-admissions" aria-labelledby="dir-admissions-title">
          <h2 id="dir-admissions-title" className="visually-hidden">User Admissions & Registrations</h2>

          {admissionSuccess && (
            <div className="badge badge-success mb-md" style={{ width: '100%', padding: '12px', justifyContent: 'center', boxSizing: 'border-box', fontSize: '0.9rem' }}>
              {admissionSuccess}
            </div>
          )}
          {admissionError && (
            <div className="badge badge-error mb-md" style={{ width: '100%', padding: '12px', justifyContent: 'center', boxSizing: 'border-box', fontSize: '0.9rem' }}>
              {admissionError}
            </div>
          )}

          <div className="grid-cols-3">
            {/* Admit Student */}
            <div className="glass-card">
              <h3>Admit New Student</h3>
              <form onSubmit={handleAdmStudentSubmit} className="mt-md" id="admit-student-form">
                <div className="form-group">
                  <label htmlFor="adm-std-id">Admission Number (Username) *</label>
                  <input
                    type="text"
                    id="adm-std-id"
                    className="form-control"
                    placeholder="e.g. std-6"
                    required
                    value={admStudent.id}
                    onChange={(e) => setAdmStudent({ ...admStudent, id: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-std-name">Full Name *</label>
                  <input
                    type="text"
                    id="adm-std-name"
                    className="form-control"
                    placeholder="e.g. Frank Miller"
                    required
                    value={admStudent.name}
                    onChange={(e) => setAdmStudent({ ...admStudent, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-std-class">Classroom *</label>
                  <select
                    id="adm-std-class"
                    className="form-control"
                    required
                    value={admStudent.class}
                    onChange={(e) => setAdmStudent({ ...admStudent, class: e.target.value })}
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 11-B">Grade 11-B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="adm-std-fees">Tuition Fees Due (KES) *</label>
                  <input
                    type="number"
                    id="adm-std-fees"
                    className="form-control"
                    required
                    value={admStudent.feesDue}
                    onChange={(e) => setAdmStudent({ ...admStudent, feesDue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-std-pass">Password *</label>
                  <input
                    type="password"
                    id="adm-std-pass"
                    className="form-control"
                    required
                    value={admStudent.password}
                    onChange={(e) => setAdmStudent({ ...admStudent, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Admit Student
                </button>
              </form>
            </div>

            {/* Admit Teacher */}
            <div className="glass-card">
              <h3>Hire New Teacher</h3>
              <form onSubmit={handleAdmTeacherSubmit} className="mt-md" id="admit-teacher-form">
                <div className="form-group">
                  <label htmlFor="adm-tch-name">Full Name *</label>
                  <input
                    type="text"
                    id="adm-tch-name"
                    className="form-control"
                    placeholder="e.g. Mrs. Jane Doe"
                    required
                    value={admTeacher.name}
                    onChange={(e) => setAdmTeacher({ ...admTeacher, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-tch-subject">Subject Department *</label>
                  <input
                    type="text"
                    id="adm-tch-subject"
                    className="form-control"
                    placeholder="e.g. History"
                    required
                    value={admTeacher.subject}
                    onChange={(e) => setAdmTeacher({ ...admTeacher, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-tch-class">Assigned Class *</label>
                  <select
                    id="adm-tch-class"
                    className="form-control"
                    required
                    value={admTeacher.class}
                    onChange={(e) => setAdmTeacher({ ...admTeacher, class: e.target.value })}
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 11-B">Grade 11-B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="adm-tch-user">Username *</label>
                  <input
                    type="text"
                    id="adm-tch-user"
                    className="form-control"
                    placeholder="e.g. jane"
                    required
                    value={admTeacher.username}
                    onChange={(e) => setAdmTeacher({ ...admTeacher, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-tch-pass">Password *</label>
                  <input
                    type="password"
                    id="adm-tch-pass"
                    className="form-control"
                    required
                    value={admTeacher.password}
                    onChange={(e) => setAdmTeacher({ ...admTeacher, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Enroll Teacher
                </button>
              </form>
            </div>

            {/* Admit Employee */}
            <div className="glass-card">
              <h3>Hire Support Staff</h3>
              <form onSubmit={handleAdmEmployeeSubmit} className="mt-md" id="admit-employee-form">
                <div className="form-group">
                  <label htmlFor="adm-emp-name">Full Name *</label>
                  <input
                    type="text"
                    id="adm-emp-name"
                    className="form-control"
                    placeholder="e.g. Bob Builder"
                    required
                    value={admEmployee.name}
                    onChange={(e) => setAdmEmployee({ ...admEmployee, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-emp-role">Role Description *</label>
                  <input
                    type="text"
                    id="adm-emp-role"
                    className="form-control"
                    placeholder="e.g. Chef, Maintenance"
                    required
                    value={admEmployee.role}
                    onChange={(e) => setAdmEmployee({ ...admEmployee, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-emp-user">Username *</label>
                  <input
                    type="text"
                    id="adm-emp-user"
                    className="form-control"
                    placeholder="e.g. bob"
                    required
                    value={admEmployee.username}
                    onChange={(e) => setAdmEmployee({ ...admEmployee, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adm-emp-pass">Password *</label>
                  <input
                    type="password"
                    id="adm-emp-pass"
                    className="form-control"
                    required
                    value={admEmployee.password}
                    onChange={(e) => setAdmEmployee({ ...admEmployee, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Enroll Staff
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* SETTINGS MANAGEMENT */}
      {activeSubTab === 'settings' && (
        <section id="dir-section-settings" aria-labelledby="dir-settings-title">
          <h2 id="dir-settings-title" className="visually-hidden">Account Configuration</h2>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Change Director Login Settings</h3>
            <p className="text-sm text-muted mt-xs">Update your username or set a new password for the headmaster profile.</p>

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

            <form onSubmit={handleSettingsSubmit} className="mt-md" id="director-settings-form">
              <div className="form-group">
                <label htmlFor="set-dir-username">Login Username</label>
                <input
                  type="text"
                  id="set-dir-username"
                  className="form-control"
                  required
                  value={settingsForm.username}
                  onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-dir-pass">New Password</label>
                <input
                  type="password"
                  id="set-dir-pass"
                  className="form-control"
                  placeholder="Set new security password"
                  required
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-dir-pass-confirm">Confirm Password</label>
                <input
                  type="password"
                  id="set-dir-pass-confirm"
                  className="form-control"
                  placeholder="Repeat new password"
                  required
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Apply Changes
              </button>
            </form>
          </div>
        </section>
      )}

      {/* SIMULATE OTHER PAGES */}
      {activeSubTab === 'view-pages' && (
        <section id="dir-section-sim" aria-labelledby="dir-sim-title">
          <h2 id="dir-sim-title" className="visually-hidden">Live Page Preview / Simulation</h2>

          <div className="glass-card mb-md">
            <h3>Live Role Page Viewer</h3>
            <p className="text-sm text-muted mt-xs">
              As a Director, you have master access. Select any of the other user dashboards below to view their live panels and verify content updates.
            </p>

            <div className="flex-gap mt-md" style={{ flexWrap: 'wrap' }}>
              <div className="role-switcher-container">
                <span className="role-switcher-label">Select View</span>
                <select
                  className="role-select"
                  value={simulatedRole}
                  onChange={(e) => setSimulatedRole(e.target.value)}
                >
                  <option value="teacher">Teacher's Dashboard</option>
                  <option value="employee">Employee's (Staff) Dashboard</option>
                  <option value="student">Student's Dashboard</option>
                </select>
              </div>

              {simulatedRole === 'student' && (
                <div className="role-switcher-container">
                  <span className="role-switcher-label">Select Student File</span>
                  <select
                    className="role-select"
                    value={simulatedStudentId}
                    onChange={(e) => setSimulatedStudentId(e.target.value)}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Render the simulated dashboard inside a wrapper card with border indicator */}
          <div style={{
            border: '3px dashed var(--color-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'rgba(230, 150, 0, 0.03)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '20px',
              backgroundColor: 'var(--color-accent)',
              color: '#000',
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '2px 10px',
              borderRadius: '10px',
              textTransform: 'uppercase',
              zIndex: 1
            }}>
              Preview Mode: Simulated {simulatedRole === 'student' ? `${students.find(s => s.id === simulatedStudentId)?.name}'s` : simulatedRole} Page
            </div>

            <div style={{ marginTop: '10px' }}>
              {simulatedRole === 'teacher' && (
                <TeacherDashboard overrideUser={{ id: 'tch-1', name: 'Mrs. Sarah Connor', subject: 'Mathematics', class: 'Grade 10-A' }} />
              )}

              {simulatedRole === 'employee' && (
                <EmployeeDashboard overrideUser={{ id: 'emp-1', name: 'Chef Marcus Wright', role: 'Kitchen Supervisor' }} />
              )}

              {simulatedRole === 'student' && (
                <StudentDashboard overrideStudentId={simulatedStudentId} />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}