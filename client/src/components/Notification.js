function Notification({ notifications, setNotifications }) {
  const handleClose = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-md shadow-lg text-white flex items-center gap-2 ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-800'
          }`}
          role="alert"
        >
          <span>{notification.message}</span>
          <button onClick={() => handleClose(notification.id)} className="ml-auto text-white" aria-label="Close notification">
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
}