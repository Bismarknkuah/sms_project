const { useState, useEffect } = React;

function Dashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }
    if (!user) {
      setLoading(true);
      axios.get('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          setLoading(false);
        })
        .catch(() => {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          window.location.href = '/login.html';
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  };

  const branches = [
    { value: 'assin_fosu', label: 'Assin Fosu (Main Campus)' },
    { value: 'accra', label: 'Accra' },
    { value: 'dunkwa_on_offin', label: 'Dunkwa-on-Offin' },
    { value: 'mankessim', label: 'Mankessim' },
    { value: 'sefwi_asawinso', label: 'Sefwi Asawinso' },
    { value: 'takoradi', label: 'Takoradi' },
    { value: 'new_edubiase', label: 'New Edubiase' }
  ];

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;
  if (error || !user) return <div className="dashboard-container"><p className="text-red-600">{error || 'Access denied. Redirecting...'}</p></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard - St. Andrews SMS</h1>
      </div>
      <div className="dashboard-info">
        <p>Logged in as: {user.role || 'Unknown'}</p>
        <p>Branch: {user.branch ? branches.find(b => b.value === user.branch)?.label || 'N/A' : 'N/A'}</p>
        <p>Accessed at: {new Date().toLocaleString('en-GB', { timeZone: 'GMT' })}</p>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

ReactDOM.render(<Dashboard />, document.getElementById('root'));