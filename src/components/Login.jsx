import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GraduationCap, Lock, User, Eye, EyeOff, ShieldAlert, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { loginUser, resetUserPassword } = useSchool();
  const [isStudent, setIsStudent] = useState(true); // toggle between student and staff login
  const [schoolCode] = useState('SPRING_OASIS');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password reset flow state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetTenantCode, setResetTenantCode] = useState('SPRING_OASIS');
  const [resetSuccess, setResetSuccess] = useState(null);
  const [resetError, setResetError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setError(null);
    setResetSuccess(null);
    setLoading(true);

    // Simulate small latency for security verification
    setTimeout(() => {
      const user = loginUser(username, password, schoolCode);
      setLoading(false);
      if (!user) {
        setError('Authentication Failed: Invalid credentials or tenant code.');
      }
    }, 450);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetUsername || !resetNewPassword) return;

    setResetError(null);
    setResetSuccess(null);

    if (resetTenantCode.trim().toUpperCase() !== 'SPRING_OASIS') {
      setResetError('Invalid School Security Code. Please enter SPRING_OASIS.');
      return;
    }

    const success = resetUserPassword(resetUsername, resetNewPassword);
    if (success) {
      setResetSuccess(`Password updated successfully! You can now log in with your new password.`);
      setUsername(resetUsername);
      setPassword('');
      setIsResetMode(false);
      setResetUsername('');
      setResetNewPassword('');
    } else {
      setResetError('User account not found. Please verify your Admission Number or Username.');
    }
  };

  return (
    <div className="login-screen-root">
      <div className="login-card-container">
        {/* Branding header */}
        <div className="login-branding">
          <div className="login-logo-circle">
            <GraduationCap size={44} className="logo-pulse-icon" />
          </div>
          <h2>SpringOasis</h2>
          <p className="subtitle">School Management Portal</p>
        </div>

        {resetSuccess && (
          <div className="login-success-alert" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '16px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <CheckCircle2 size={18} />
            <span>{resetSuccess}</span>
          </div>
        )}

        {!isResetMode ? (
          <>
            {/* Glass tab selection */}
            <div className="login-tabs">
              <button 
                type="button"
                className={`login-tab ${isStudent ? 'active' : ''}`}
                onClick={() => {
                  setIsStudent(true);
                  setError(null);
                  setUsername('');
                  setPassword('');
                }}
              >
                Student Login
              </button>
              <button 
                type="button"
                className={`login-tab ${!isStudent ? 'active' : ''}`}
                onClick={() => {
                  setIsStudent(false);
                  setError(null);
                  setUsername('');
                  setPassword('');
                }}
              >
                Staff & Faculty Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error-alert">
                  <ShieldAlert size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="login-username">
                  {isStudent ? 'Admission Number' : 'Username'}
                </label>
                <div className="login-input-wrapper">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    id="login-username" 
                    className="form-control login-input"
                    placeholder={isStudent ? 'e.g. STD-2026-001 or std-1' : 'e.g. director, sarah, marcus'}
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <button 
                    type="button"
                    className="forgot-password-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                      setResetError(null);
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="login-password" 
                    className="form-control login-input"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>
          </>
        ) : (
          /* Password Reset Card */
          <div className="password-reset-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={() => setIsResetMode(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 10px', minHeight: 'auto' }}
                aria-label="Back to login"
              >
                <ArrowLeft size={16} />
              </button>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Reset Password</h3>
            </div>

            {resetError && (
              <div className="login-error-alert">
                <ShieldAlert size={18} />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="reset-username">Admission Number / Username</label>
                <div className="login-input-wrapper">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    id="reset-username" 
                    className="form-control login-input"
                    placeholder="e.g. director, sarah, std-1"
                    required
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reset-code">School Security Code</label>
                <div className="login-input-wrapper">
                  <KeyRound size={18} className="input-icon" />
                  <input 
                    type="text" 
                    id="reset-code" 
                    className="form-control login-input"
                    placeholder="SPRING_OASIS"
                    required
                    value={resetTenantCode}
                    onChange={(e) => setResetTenantCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reset-new-password">New Password</label>
                <div className="login-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="reset-new-password" 
                    className="form-control login-input"
                    placeholder="Enter new password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary login-btn">
                Confirm & Update Password
              </button>
            </form>
          </div>
        )}

        <div className="login-footer-info">
          <span>Secured Academic Records Platform © 2026</span>
        </div>
      </div>
    </div>
  );
}
