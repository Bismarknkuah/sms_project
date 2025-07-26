function FormInput({ type = 'text', id, label, value, onChange, required, validate, error, showStrength }) {
  const [strength, setStrength] = React.useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (showStrength && type === 'password') {
      let score = 0;
      if (val.length >= 8) score += 1;
      if (/[A-Z]/.test(val)) score += 1;
      if (/[a-z]/.test(val)) score += 1;
      if (/\d/.test(val)) score += 1;
      if (/[@$!%*?&]/.test(val)) score += 1;

      setStrength(score <= 1 ? 'Weak' : score <= 3 ? 'Moderate' : 'Strong');
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={handleInputChange}
        required={required}
        className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : null}
      />
      {showStrength && strength && (
        <div className={`text-sm mt-1 ${strength === 'Weak' ? 'text-red-500' : strength === 'Moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
          Password Strength: {strength}
        </div>
      )}
      {error && (
        <div id={`${id}-error`} className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}