'use client';
import { useState } from 'react';

export default function Field({ label, type = 'text', value, onChange, onBlur, error, placeholder, autoComplete, inputMode }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-base font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={isPw && show ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3.5 text-lg outline-none transition focus:bg-white focus:ring-4 ${
            isPw ? 'pr-20' : ''
          } ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'}`}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-base font-bold text-blue-600">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-base font-semibold text-red-600">{error}</p>}
    </div>
  );
}