const isInt = (v) => /^\d+$/.test(String(v ?? '').trim());

export function validateUsername(v = '') {
  v = v.trim();
  if (!v) return 'Username is required';
  if (v.length < 3 || v.length > 20) return 'Username must be 3 to 20 characters';
  if (!/^[A-Za-z0-9_]+$/.test(v)) return 'Use only letters, numbers and underscore';
  return null;
}
export function validateEmail(v = '') {
  v = v.trim();
  if (!v) return 'Email is required';
  if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address';
  return null;
}
export function validatePassword(v = '') {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters';
  if (v.length > 64) return 'Password must be 64 characters or fewer';
  if (!/[a-z]/.test(v)) return 'Add at least one lowercase letter';
  if (!/[A-Z]/.test(v)) return 'Add at least one uppercase letter';
  if (!/[0-9]/.test(v)) return 'Add at least one number';
  return null;
}
export function validateSugar(v) {
  if (!isInt(v)) return 'Enter a whole number';
  const n = parseInt(v, 10);
  if (n < 20 || n > 900) return 'Sugar must be between 20 and 900';
  return null;
}
export function validateBP(sys, dia, pulse) {
  if (!isInt(sys)) return 'Enter the upper (systolic) number';
  if (!isInt(dia)) return 'Enter the lower (diastolic) number';
  const s = parseInt(sys, 10), d = parseInt(dia, 10);
  if (s < 50 || s > 300) return 'Upper value must be between 50 and 300';
  if (d < 30 || d > 200) return 'Lower value must be between 30 and 200';
  if (s <= d) return 'Upper value must be higher than the lower value';
  if (pulse !== '' && pulse != null) {
    if (!isInt(pulse)) return 'Pulse must be a whole number';
    const p = parseInt(pulse, 10);
    if (p < 30 || p > 250) return 'Pulse must be between 30 and 250';
  }
  return null;
}