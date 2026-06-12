import { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GraduationCap, Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { loginUser } = useSchool();
  const [isStudent, setIsStudent] = useState(true); // toggle between student and staff login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setError(null);
    setLoading(true);

    // Simulate small latency for premium UI transition
    setTimeout(() => {
      const user = loginUser(username, password);
      setLoading(false);
      if (!user) {
        setError(isStudent 
          ? 'Invalid Admission Number or password. Students should use standard IDs (e.g. std-1).' 
          : 'Invalid Username or password. Staff should use set credentials.'
        );
      }
    }, 450);
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
          <p className="subtitle">School Management Environment</p>
        </div>

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
            Staff & Faculty
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
                placeholder={isStudent ? 'e.g. std-1' : 'e.g. director, sarah'}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
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

        <div className="login-footer-info">
          <span>Secure Academic Ledger • 2026</span>
        </div>
      </div>
    </div>
  );
}
