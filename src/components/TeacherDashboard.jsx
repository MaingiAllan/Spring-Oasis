import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BookOpen, CheckSquare, Plus, Save, Award, Settings } from 'lucide-react';

export default function TeacherDashboard({ overrideUser }) {
  const {
    students,
    homework,
    studentAttendance,
    examScores,
    addHomework,
    recordStudentAttendance,
    recordExamScore,
    admitStudent,
    updateUserCredentials,
    updateStudentSubjects
  } = useSchool();

  // Current Teacher Profile
  const defaultTeacher = { id: 'tch-1', name: 'Mrs. Sarah Connor', subject: 'Mathematics', class: 'Grade 10-A' };
  const teacher = overrideUser || defaultTeacher;

  const [activeSubTab, setActiveSubTab] = useState('attendance'); // attendance, homework, scores, admission, settings

  // Filter students belonging to this teacher's class
  const classStudents = students.filter(s => s.class === teacher.class);

  // Homework Form
  const [hwForm, setHwForm] = useState({ title: '', description: '', dueDate: '' });

  // Attendance Form States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStates, setAttendanceStates] = useState({});

  // Score Form States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [examScore, setExamScore] = useState('');
  const [assessmentName, setAssessmentName] = useState('Midterm');
  const [customAssessmentName, setCustomAssessmentName] = useState('');

  // Admissions Form States
  const [admStudent, setAdmStudent] = useState({ id: '', name: '', class: teacher.class, feesDue: '5000', password: 'password' });
  const [admissionSuccess, setAdmissionSuccess] = useState(null);
  const [admissionError, setAdmissionError] = useState(null);

  // Settings Form States
  const [settingsForm, setSettingsForm] = useState({ username: teacher.username || '', password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  // Subject Management States
  const ALL_SCHOOL_SUBJECTS = ['Mathematics', 'Science', 'English Literature', 'History', 'Geography', 'Art', 'Music', 'Physical Education'];
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedStudentForSubjects, setSelectedStudentForSubjects] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const openManageSubjectsModal = (student) => {
    setSelectedStudentForSubjects(student);
    setSelectedSubjects(student.subjects || ['Mathematics', 'Science', 'English Literature']);
    setSubjectModalOpen(true);
  };

  const handleSaveSubjects = (e) => {
    e.preventDefault();
    if (selectedStudentForSubjects) {
      updateStudentSubjects(selectedStudentForSubjects.id, selectedSubjects);
      setSubjectModalOpen(false);
      setSelectedStudentForSubjects(null);
    }
  };

  // Attendance states are derived dynamically during render, no useEffect needed.

  // Handlers
  const handleHwSubmit = (e) => {
    e.preventDefault();
    if (!hwForm.title || !hwForm.dueDate) return;
    
    addHomework({
      teacherId: teacher.id,
      teacherName: teacher.name,
      class: teacher.class,
      subject: teacher.subject,
      title: hwForm.title,
      description: hwForm.description,
      dueDate: hwForm.dueDate
    });
    setHwForm({ title: '', description: '', dueDate: '' });
    alert('Homework assignment posted!');
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStates((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    const records = classStudents.map((student) => {
      const status = attendanceStates[student.id] ?? (
        studentAttendance.find(
          (att) => att.studentId === student.id && att.date === attendanceDate
        )?.status ?? 'Present'
      );
      return {
        studentId: student.id,
        studentName: student.name,
        status
      };
    });

    recordStudentAttendance(records, attendanceDate, teacher.class);
    alert(`Attendance for ${attendanceDate} saved successfully!`);
  };

  const handleScoreSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId || !examScore || Number(examScore) < 0 || Number(examScore) > 100) return;
    
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const finalAssessment = assessmentName === 'Custom' ? customAssessmentName : assessmentName;
    if (!finalAssessment) {
      alert('Please specify an assessment name.');
      return;
    }

    recordExamScore({
      studentId: selectedStudentId,
      studentName: student.name,
      subject: teacher.subject,
      score: Number(examScore),
      assessment: finalAssessment,
      grader: teacher.name
    });

    setExamScore('');
    setSelectedStudentId('');
    setCustomAssessmentName('');
    alert(`Recorded score for ${student.name} in ${finalAssessment}: ${examScore}%`);
  };

  const handleAdmStudentSubmit = (e) => {
    e.preventDefault();
    setAdmissionError(null);
    setAdmissionSuccess(null);
    try {
      admitStudent({
        ...admStudent,
        class: teacher.class // Force to teacher's class
      });
      setAdmissionSuccess(`Student "${admStudent.name}" admitted successfully into your class with Admission Number "${admStudent.id}"!`);
      setAdmStudent({ id: '', name: '', class: teacher.class, feesDue: '5000', password: 'password' });
    } catch (err) {
      setAdmissionError(err.message);
    }
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
    updateUserCredentials('teacher', teacher.id, settingsForm.username, settingsForm.password);
    setSettingsSuccess('Credentials updated successfully!');
    setSettingsForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  // Filter homework assigned by this teacher
  const teacherHomework = homework.filter(h => h.teacherId === teacher.id);
  
  // Filter scores for this teacher's subject
  const subjectScores = examScores.filter(s => s.subject === teacher.subject);

  return (
    <div className="teacher-dashboard-root">
      {/* Profile summary card */}
      <div className="glass-card mb-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Classroom: {teacher.class}</h2>
          <p className="text-sm text-muted">Educator: <span className="font-bold">{teacher.name}</span> | Department: <span className="font-bold">{teacher.subject}</span></p>
        </div>
        
        <nav aria-label="Teacher dashboard section tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            id="tch-tab-attendance"
            className={`btn ${activeSubTab === 'attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('attendance')}
          >
            <CheckSquare size={16} /> Attendance
          </button>
          <button 
            id="tch-tab-homework"
            className={`btn ${activeSubTab === 'homework' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('homework')}
          >
            <BookOpen size={16} /> Homework Board
          </button>
          <button 
            id="tch-tab-scores"
            className={`btn ${activeSubTab === 'scores' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('scores')}
          >
            <Award size={16} /> Grades & Exams
          </button>
          <button 
            id="tch-tab-admission"
            className={`btn ${activeSubTab === 'admission' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('admission')}
          >
            <Plus size={16} /> Class & Enrollment
          </button>
          <button 
            id="tch-tab-settings"
            className={`btn ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSubTab('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        </nav>
      </div>

      {/* 1. ATTENDANCE LOGGER */}
      {activeSubTab === 'attendance' && (
        <section id="tch-section-attendance" aria-labelledby="tch-attendance-title">
          <h3 id="tch-attendance-title" className="visually-hidden">Student Attendance Ledger</h3>
          
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>Daily Attendance Register</h3>
              <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="att-date" style={{ margin: 0 }}>Register Date:</label>
                <input 
                  type="date" 
                  id="att-date" 
                  className="form-control" 
                  style={{ minHeight: '38px', padding: '0.25rem 0.5rem', width: 'auto' }}
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>

            {classStudents.length === 0 ? (
              <p className="empty-state">No students are currently enrolled in your class: {teacher.class}.</p>
            ) : (
              <form onSubmit={handleAttendanceSubmit} id="class-attendance-form">
                <div className="table-wrapper mb-md">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th className="text-center" style={{ width: '45%' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student) => {
                        const status = attendanceStates[student.id] ?? (
                          studentAttendance.find(
                            (att) => att.studentId === student.id && att.date === attendanceDate
                          )?.status ?? 'Present'
                        );
                        return (
                          <tr key={student.id}>
                            <td>
                              <span className="font-bold">{student.name}</span>
                              <span className="text-xs text-muted" style={{ display: 'block' }}>ID: {student.id}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                <label className="toggle-switch-container" style={{ margin: 0 }}>
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    value="Present" 
                                    checked={status === 'Present'}
                                    onChange={() => handleAttendanceChange(student.id, 'Present')}
                                    style={{ accentColor: 'var(--color-success)' }}
                                  />
                                  <span className="text-sm">Present</span>
                                </label>
                                <label className="toggle-switch-container" style={{ margin: 0 }}>
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    value="Absent" 
                                    checked={status === 'Absent'}
                                    onChange={() => handleAttendanceChange(student.id, 'Absent')}
                                    style={{ accentColor: 'var(--color-error)' }}
                                  />
                                  <span className="text-sm">Absent</span>
                                </label>
                                <label className="toggle-switch-container" style={{ margin: 0 }}>
                                  <input 
                                    type="radio" 
                                    name={`att-${student.id}`} 
                                    value="Late" 
                                    checked={status === 'Late'}
                                    onChange={() => handleAttendanceChange(student.id, 'Late')}
                                    style={{ accentColor: 'var(--color-warning)' }}
                                  />
                                  <span className="text-sm">Late</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Save Attendance Records
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* 2. HOMEWORK BOARD */}
      {activeSubTab === 'homework' && (
        <section id="tch-section-homework" aria-labelledby="tch-homework-title">
          <h3 id="tch-homework-title" className="visually-hidden">Homework Posting & Management</h3>
          
          <div className="grid-cols-2">
            <div className="glass-card">
              <h3>Create Homework Assignment</h3>
              <form onSubmit={handleHwSubmit} className="mt-md" id="post-homework-form">
                <div className="form-group">
                  <label htmlFor="hw-title">Assignment Title *</label>
                  <input 
                    type="text" 
                    id="hw-title" 
                    className="form-control" 
                    placeholder="e.g. Chapter 4 Equations Homework" 
                    required
                    value={hwForm.title}
                    onChange={(e) => setHwForm({...hwForm, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hw-due">Due Date *</label>
                  <input 
                    type="date" 
                    id="hw-due" 
                    className="form-control" 
                    required
                    value={hwForm.dueDate}
                    onChange={(e) => setHwForm({...hwForm, dueDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hw-desc">Instructions / Description</label>
                  <textarea 
                    id="hw-desc" 
                    className="form-control" 
                    placeholder="Provide guidance, textbook page numbers, exercises..."
                    value={hwForm.description}
                    onChange={(e) => setHwForm({...hwForm, description: e.target.value})}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Post Homework Assignment
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3>Active Tasks Assigned ({teacherHomework.length})</h3>
              <div className="feed-list mt-md">
                {teacherHomework.length === 0 ? (
                  <p className="text-muted">You haven't assigned any homework yet.</p>
                ) : (
                  teacherHomework.map((hw) => (
                    <div className="feed-item" key={hw.id}>
                      <div className="feed-icon"><BookOpen /></div>
                      <div className="feed-content">
                        <span className="font-bold">{hw.title}</span>
                        <p className="text-sm mt-md">{hw.description || 'No instructions provided.'}</p>
                        <div className="feed-meta">
                          <span>Target: {hw.class}</span>
                          <span>Posted: {hw.datePosted}</span>
                          <span style={{ color: 'var(--color-error)' }}>Due: {hw.dueDate}</span>
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

      {/* 3. EXAMS & GRADES */}
      {activeSubTab === 'scores' && (
        <section id="tch-section-scores" aria-labelledby="tch-scores-title">
          <h3 id="tch-scores-title" className="visually-hidden">Exam Marks & Student Grading</h3>
          
          <div className="grid-cols-2">
            <div className="glass-card">
              <h3>Input Student Exam Marks</h3>
              <form onSubmit={handleScoreSubmit} className="mt-md" id="grade-exam-form">
                <div className="form-group">
                  <label htmlFor="grade-student">Select Student *</label>
                  <select 
                    id="grade-student" 
                    className="form-control" 
                    required 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">-- Choose Student --</option>
                    {classStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="grade-assessment">Assessment Slot *</label>
                    <select 
                      id="grade-assessment" 
                      className="form-control" 
                      required 
                      value={assessmentName}
                      onChange={(e) => setAssessmentName(e.target.value)}
                    >
                      <option value="Quiz 1">Quiz 1</option>
                      <option value="Quiz 2">Quiz 2</option>
                      <option value="Midterm">Midterm Exam</option>
                      <option value="Final Exam">Final Exam</option>
                      <option value="Class Project">Class Project</option>
                      <option value="Custom">-- Custom Slot Name --</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="grade-value">Exam Score (0 - 100) *</label>
                    <input 
                      type="number" 
                      id="grade-value" 
                      min="0" 
                      max="100" 
                      className="form-control" 
                      placeholder="e.g. 92" 
                      required
                      value={examScore}
                      onChange={(e) => setExamScore(e.target.value)}
                    />
                  </div>
                </div>

                {assessmentName === 'Custom' && (
                  <div className="form-group">
                    <label htmlFor="grade-custom-assessment">Custom Assessment Name *</label>
                    <input 
                      type="text" 
                      id="grade-custom-assessment" 
                      className="form-control" 
                      placeholder="e.g. Homework 4, Oral Exam" 
                      required
                      value={customAssessmentName}
                      onChange={(e) => setCustomAssessmentName(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Award size={18} /> Record Exam Grade
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3>Recent Subject Grades ({subjectScores.length})</h3>
              
              <div className="table-wrapper mt-md">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assessment</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectScores.map((scoreObj) => {
                      // Letter grade calculation
                      let letterGrade = 'F';
                      if (scoreObj.score >= 90) letterGrade = 'A';
                      else if (scoreObj.score >= 80) letterGrade = 'B';
                      else if (scoreObj.score >= 70) letterGrade = 'C';
                      else if (scoreObj.score >= 60) letterGrade = 'D';

                      return (
                        <tr key={scoreObj.id}>
                          <td><span className="font-bold">{scoreObj.studentName}</span></td>
                          <td>{scoreObj.assessment || 'General'}</td>
                          <td>{scoreObj.score}%</td>
                          <td>
                            <span className={`badge ${letterGrade === 'A' || letterGrade === 'B' ? 'badge-success' : letterGrade === 'C' ? 'badge-info' : 'badge-error'}`}>
                              Grade {letterGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {subjectScores.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">No exams recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. ENROLL STUDENT TAB */}
      {activeSubTab === 'admission' && (
        <section id="tch-section-admission" aria-labelledby="tch-admission-title">
          <h3 id="tch-admission-title" className="visually-hidden">Class Roster & Enrollment</h3>
          
          <div className="grid-cols-2">
            {/* Student Roster & Subjects */}
            <div className="glass-card">
              <h3>Class Roster ({classStudents.length} Students)</h3>
              <p className="text-sm text-muted mt-xs mb-md">Manage academic subjects for students in your class.</p>
              
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Enrolled Subjects</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <span className="font-bold">{s.name}</span>
                          <span className="text-xs text-muted" style={{ display: 'block' }}>ID: {s.id}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(s.subjects || ['Mathematics', 'Science', 'English Literature']).map((subj) => (
                              <span key={subj} className="badge badge-info" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                {subj}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => openManageSubjectsModal(s)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--color-border)' }}
                          >
                            <Settings size={12} />
                            Subjects
                          </button>
                        </td>
                      </tr>
                    ))}
                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">No students enrolled in your class.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enroll Student Form */}
            <div className="glass-card">
              <h3>Enroll New Student (Class: {teacher.class})</h3>
              <p className="text-sm text-muted mt-xs">Admit a new student directly into your class list.</p>

              {admissionSuccess && (
                <div className="badge badge-success mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                  {admissionSuccess}
                </div>
              )}
              {admissionError && (
                <div className="badge badge-error mt-md" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                  {admissionError}
                </div>
              )}

              <form onSubmit={handleAdmStudentSubmit} className="mt-md" id="teacher-admit-student-form">
                <div className="form-group">
                  <label htmlFor="tch-adm-id">Admission Number *</label>
                  <input 
                    type="text" 
                    id="tch-adm-id" 
                    className="form-control" 
                    placeholder="e.g. std-6" 
                    required
                    value={admStudent.id}
                    onChange={(e) => setAdmStudent({...admStudent, id: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tch-adm-name">Student Full Name *</label>
                  <input 
                    type="text" 
                    id="tch-adm-name" 
                    className="form-control" 
                    placeholder="e.g. Frank Miller" 
                    required
                    value={admStudent.name}
                    onChange={(e) => setAdmStudent({...admStudent, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tch-adm-fees">Tuition Fees ($) *</label>
                  <input 
                    type="number" 
                    id="tch-adm-fees" 
                    className="form-control" 
                    required
                    value={admStudent.feesDue}
                    onChange={(e) => setAdmStudent({...admStudent, feesDue: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tch-adm-pass">Initial Password *</label>
                  <input 
                    type="password" 
                    id="tch-adm-pass" 
                    className="form-control" 
                    required
                    value={admStudent.password}
                    onChange={(e) => setAdmStudent({...admStudent, password: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Enroll Student
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* 5. CREDENTIALS SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <section id="tch-section-settings" aria-labelledby="tch-settings-title">
          <h3 id="tch-settings-title" className="visually-hidden">Teacher Profile Settings</h3>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Teacher Security Settings</h3>
            <p className="text-sm text-muted mt-xs">Update your portal username and secure password.</p>

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

            <form onSubmit={handleSettingsSubmit} className="mt-md" id="teacher-settings-form">
              <div className="form-group">
                <label htmlFor="set-tch-user">Username</label>
                <input 
                  type="text" 
                  id="set-tch-user" 
                  className="form-control" 
                  required
                  value={settingsForm.username}
                  onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-tch-pass">New Password</label>
                <input 
                  type="password" 
                  id="set-tch-pass" 
                  className="form-control" 
                  placeholder="Enter new password"
                  required
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="set-tch-pass-confirm">Confirm Password</label>
                <input 
                  type="password" 
                  id="set-tch-pass-confirm" 
                  className="form-control" 
                  placeholder="Repeat new password"
                  required
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Credentials
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Manage Subjects Modal */}
      {subjectModalOpen && selectedStudentForSubjects && (
        <div className="modal-overlay" onClick={() => { setSubjectModalOpen(false); setSelectedStudentForSubjects(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Manage Enrolled Subjects</h3>
            <p className="text-sm text-muted mb-md">
              Update subjects for <strong>{selectedStudentForSubjects.name}</strong> ({selectedStudentForSubjects.class}).
            </p>
            <form onSubmit={handleSaveSubjects}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }} className="mb-md">
                {ALL_SCHOOL_SUBJECTS.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, sub]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
                          }
                        }}
                      />
                      <span>{sub}</span>
                    </label>
                  );
                })}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setSubjectModalOpen(false); setSelectedStudentForSubjects(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
