const { useState, useEffect } = React;

function LoginApp() {
  const [formData, setFormData] = useState({
    userType: '',
    branch: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const branches = [
    { value: 'assin_fosu', label: 'Assin Fosu (Main Campus)' },
    { value: 'accra', label: 'Accra' },
    { value: 'dunkwa_on_offin', label: 'Dunkwa-on-Offin' },
    { value: 'mankessim', label: 'Mankessim' },
    { value: 'sefwi_asawinso', label: 'Sefwi Asawinso' },
    { value: 'takoradi', label: 'Takoradi' },
    { value: 'new_edubiase', label: 'New Edubiase' }
  ];

  const userTypes = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'branch_admin', label: 'Branch Admin' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'transport_manager', label: 'Transport Manager' },
    { value: 'house_master', label: 'House Master' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'staff', label: 'Staff' },
    { value: 'headmaster', label: 'Headmaster' },
    { value: 'pta_chairman', label: 'PTA Chairman' },
    { value: 'student', label: 'Student' },
    { value: 'it_admin', label: 'IT Admin' },
    { value: 'security_officer', label: 'Security Officer' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
    if (field === 'userType' && value === 'super_admin') {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.userType || !formData.username || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.userType !== 'super_admin' && !formData.branch) {
      setError('Please select a branch/campus');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/admin/auth/login', {
        role: formData.userType,
        username: formData.username,
        password: formData.password,
        branchId: formData.userType === 'super_admin' ? null : formData.branch
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const isSuperAdmin = formData.userType === 'super_admin';

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>St. Andrews SMS</h1>
        <p>School Management System</p>
        <div className="form-group">
          <label htmlFor="userType">Login As:</label>
          <select
            id="userType"
            value={formData.userType}
            onChange={(e) => handleInputChange('userType', e.target.value)}
            required
          >
            <option value="" disabled>Select User Type</option>
            {userTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>
      <form onSubmit={handleLogin}>
        <div className={`form-group ${isSuperAdmin ? 'hidden' : ''}`}>
          <label htmlFor="branch" style={{ display: 'inline-block', marginRight: '1rem', minWidth: '120px' }}>Branch/Campus:</label>
          <select
            id="branch"
            value={formData.branch}
            onChange={(e) => handleInputChange('branch', e.target.value)}
            required={!isSuperAdmin}
            style={{ display: 'inline-block', width: 'calc(100% - 140px)' }}
          >
            <option value="" disabled>Select Branch</option>
            {branches.map(branch => (
              <option key={branch.value} value={branch.value}>{branch.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="username">Username or Email:</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Enter your username or email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading && <div className="loading-spinner"></div>}
          <span>{isLoading ? 'Logging in...' : 'Login'}</span>
        </button>
      </form>
      <div className="links-container">
        <a onClick={() => openResetModal()}>Forgot Password?</a>
        <a href="/index.html" onClick={(e) => { e.preventDefault(); window.location.href = '/index.html'; }}>Back to Home</a>
      </div>
    </div>
  );
}

function openResetModal() {
  document.getElementById('resetModal').classList.add('show');
}

function closeResetModal() {
  document.getElementById('resetModal').classList.remove('show');
  document.getElementById('resetForm').reset();
  document.getElementById('resetMessage').innerHTML = '';
}

function handlePasswordReset(event) {
  event.preventDefault();
  const resetBtn = document.getElementById('resetBtn');
  const messageDiv = document.getElementById('resetMessage');
  const email = document.getElementById('resetEmail').value;
  const role = document.getElementById('resetRole').value;

  resetBtn.innerHTML = '<div class="loading-spinner"></div><span>Sending...</span>';
  resetBtn.disabled = true;

  setTimeout(() => {
    messageDiv.innerHTML = `
      <div style="color: #1e40af; font-size: 0.875rem; text-align: center; padding: 0.75rem; background: #dbeafe; border: 1px solid #93c5fd; border-radius: 6px; margin-top: 1rem;">
        Password reset link has been sent to ${email}. Please check your email.
      </div>
    `;
    resetBtn.innerHTML = '<span>Send Reset Link</span>';
    resetBtn.disabled = false;
    setTimeout(closeResetModal, 3000);
  }, 2000);
}

window.onclick = function(event) {
  const modal = document.getElementById('resetModal');
  if (event.target === modal) closeResetModal();
};

ReactDOM.render(<LoginApp />, document.getElementById('root'));