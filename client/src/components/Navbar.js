function Navbar({ user }) {
  const [search, setSearch] = React.useState('');
  const [branches, setBranches] = React.useState([]);

  React.useEffect(() => {
    if (user.role === 'super_admin') {
      axios.get('/api/admin/branches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(response => setBranches(response.data.branches)).catch(console.error);
    }
  }, [user]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    // Trigger search API call (debounced in production)
    axios.get(`/api/admin/security/search?query=${encodeURIComponent(e.target.value)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(response => {
      // Handle search results (e.g., update state or redirect)
      console.log(response.data);
    }).catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login.html';
  };

  return (
    <header className="bg-white p-4 shadow-md flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-800 bg-clip-text text-transparent">
          St. Andrews SMS
        </h1>
        {user.role === 'super_admin' && (
          <select className="p-2 border rounded-md">
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>{branch.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search roles or policies..."
            className="p-2 pl-8 border rounded-full w-64"
            aria-label="Search security data"
          />
          <i className="fas fa-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-800 rounded-full flex items-center justify-center text-white">
            {user.name ? user.name.charAt(0).toUpperCase() : 'SA'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user.name || 'Security Admin'}</p>
            <p className="text-xs text-gray-500">{user.role === 'super_admin' ? 'All Branches' : user.branchName}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn bg-red-500 text-white px-3 py-1 rounded-md">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
}