function ResetPassword() {
  return (
    <div className="reset-container">
      <div className="reset-header">
        <h1>Reset Password</h1>
      </div>
      <div className="reset-content">
        <p>Check your email for the password reset link. <a href="/login.html">Back to Login</a></p>
      </div>
    </div>
  );
}

ReactDOM.render(<ResetPassword />, document.getElementById('root'));