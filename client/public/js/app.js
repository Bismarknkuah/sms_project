const { useState, useEffect } = React;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        window.location.href = '/login.html';
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div>
      <header className="header">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">SMS</div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>School Management System</div>
            </div>
          </div>
          <nav className="nav-menu">
            <a href="/index.html" className="nav-link">Home</a>
            <a href="/dashboard.html" className="nav-link">Dashboard</a>
            <a href="#" className="nav-link" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login.html'; }}>Logout</a>
          </nav>
        </div>
      </header>
      <main>
        <p style={{ padding: '20px', textAlign: 'center' }}>Welcome to the St. Andrews SMS App. Navigate using the menu above.</p>
      </main>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));