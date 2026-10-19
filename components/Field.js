'use client';
import { useState } from 'react';

export default function Field({ label, type = 'text', value, onChange, onBlur, error, placeholder, autoComplete, inputMode }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div className="field">
      <label>{label}</label>
      <div className="inputwrap">
        <input
          type={isPw && show ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={error ? 'bad' : ''}
        />
        {isPw && (
          <button type="button" className="eye" onClick={() => setShow(!show)}>
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="err">{error}</p>}
    </div>
  );
}