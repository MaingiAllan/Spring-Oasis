import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { X, KeyRound, Sun, Moon, LogOut, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function UserSideDrawer({ isOpen, onClose, currentUser, profile, toggleTheme, theme, logoutUser }) {
  const { resetUserPassword } = useSchool();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);

  if (!isOpen) return null;

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setPasswordMsg(null);
    setPasswordErr(null);

    const success = resetUserPassword(currentUser.username || currentUser.id, newPassword);
    if (success) {
      setPasswordMsg('Password changed successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    } else {
      setPasswordErr('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="user-drawer-backdrop" onClick={onClose}>
      <aside className="user-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <Sparkles className="icon-glow" size={20} />
            <span>Dedicated User Desk</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close side tab">
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="drawer-user-card">
          <div className="drawer-avatar">
            {profile.initials}
          </div>
          <div className="drawer-user-info">
            <h3 className="drawer-user-name">{profile.name}</h3>
            <span className="drawer-user-sub">{profile.sub}</span>
            <span className="badge badge-info drawer-role-tag">
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Quick Details List */}
        <div className="drawer-section">
          <h4 className="drawer-section-title">Account Details</h4>
          <div className="drawer-details-grid">
            <div className="drawer-detail-item">
              <span className="label">User Identifier:</span>
              <span className="value font-bold">{currentUser.username || currentUser.id}</span>
            </div>
            <div className="drawer-detail-item">
              <span className="label">Tenant Code:</span>
              <span className="value">{currentUser.schoolCode || 'SPRING_OASIS'}</span>
            </div>
            {currentUser.subject && (
              <div className="drawer-detail-item">
                <span className="label">Department / Subject:</span>
                <span className="value">{currentUser.subject}</span>
              </div>
            )}
            {currentUser.class && (
              <div className="drawer-detail-item">
                <span className="label">Assigned Class:</span>
                <span className="value">{currentUser.class}</span>
              </div>
            )}
            {currentUser.jobRole && (
              <div className="drawer-detail-item">
                <span className="label">Job Designation:</span>
                <span className="value">{currentUser.jobRole}</span>
              </div>
            )}
            <div className="drawer-detail-item">
              <span className="label">Academic Term:</span>
              <span className="value">Spring Term 2026</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls & Password Settings */}
        <div className="drawer-section">
          <h4 className="drawer-section-title">Quick Settings</h4>
          
          {/* Theme Switcher Toggle */}
          <div className="drawer-action-row" onClick={toggleTheme}>
            <div className="drawer-action-left">
              {theme === 'light' ? <Sun size={18} className="text-warning" /> : <Moon size={18} className="text-info" />}
              <span>Interface Theme</span>
            </div>
            <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
              {theme} Mode
            </span>
          </div>

          {/* Change Password Toggle */}
          <div 
            className="drawer-action-row" 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <div className="drawer-action-left">
              <KeyRound size={18} className="text-primary-color" />
              <span>Change Account Password</span>
            </div>
            <span className="text-xs text-muted">{showPasswordForm ? 'Hide' : 'Set New'}</span>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="drawer-password-form">
              {passwordMsg && (
                <div className="badge badge-success" style={{ display: 'flex', gap: '6px', padding: '8px', marginBottom: '8px', width: '100%' }}>
                  <CheckCircle2 size={16} />
                  <span>{passwordMsg}</span>
                </div>
              )}
              {passwordErr && (
                <div className="badge badge-error" style={{ display: 'flex', gap: '6px', padding: '8px', marginBottom: '8px', width: '100%' }}>
                  <Lock size={16} />
                  <span>{passwordErr}</span>
                </div>
              )}
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '0.75rem' }}>New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter new password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ minHeight: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Save New Password
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="drawer-footer">
          <button className="btn btn-danger drawer-logout-btn" onClick={logoutUser}>
            <LogOut size={18} />
            <span>Sign Out of Session</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
