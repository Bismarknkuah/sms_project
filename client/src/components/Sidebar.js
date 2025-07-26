function Sidebar({ user, socket }) {
  const [isOpen, setIsOpen] = React.useState(true);
  const navItems = [
    { name: 'Overview', icon: 'fas fa-shield-alt', path: '/overview', roles: ['security_admin', 'super_admin'] },
    { name: 'Roles', icon: 'fas fa-user-tag', path: '/roles', roles: ['security_admin', 'super_admin'] },
    { name: 'Permissions', icon: 'fas fa-key', path: '/permissions', roles: ['security_admin', 'super_admin'] },
    { name: 'Policies', icon: 'fas fa-cog', path: '/policies', roles: ['security_admin', 'super_admin'] },
    { name: 'Analytics', icon: 'fas fa-chart-bar', path: '/analytics', roles: ['super_admin'] }
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-purple-900 to-indigo-900 text-white transition-transform duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 text-center border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-red-500 rounded-full mx-auto flex items-center justify-center text-xl">
          S
        </div>
        {isOpen && (
          <>
            <h2 className="mt-2 text-lg font-bold">St. Andrews SMS</h2>
            <p className="text-xs opacity-80">{user.role === 'super_admin' ? 'All Branches' : user.branchName}</p>
          </>
        )}
      </div>
      <nav className="p-4">
        <button onClick={toggleSidebar} className="mb-4 text-white" aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <i className={`fas fa-${isOpen ? 'chevron-left' : 'chevron-right'}`}></i>
        </button>
        <ul>
          {navItems
            .filter(item => item.roles.includes(user.role))
            .map(item => (
              <li key={item.path} className="mb-2">
                <a
                  href={item.path}
                  className="flex items-center p-2 hover:bg-indigo-700 rounded-md"
                  aria-label={item.name}
                >
                  <i className={`${item.icon} w-6`}></i>
                  {isOpen && <span className="ml-2">{item.name}</span>}
                </a>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}