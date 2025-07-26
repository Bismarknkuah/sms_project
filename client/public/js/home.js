const { useEffect } = React;

function Home() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard.html';
    }
  }, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>St. Andrews SMS Home</h1>
      </div>
      <div className="home-content">
        <p>Welcome to the St. Andrews School Management System. Please <a href="/login.html">login</a> to proceed.</p>
      </div>
    </div>
  );
}

ReactDOM.render(<Home />, document.getElementById('root'));