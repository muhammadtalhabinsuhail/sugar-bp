'use client';
import { useRef, useState } from 'react';
import Header, { Avatar } from '../../components/Header';
import { useUser } from '../../components/useUser';

// Crop to a centered square, shrink to 256px, compress to JPEG
function resize(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 256, 256);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Could not read this image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function Profile() {
  const [user, setUser] = useUser();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef();

  async function save(photo) {
    setBusy(true);
    const r = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo }),
    });
    setBusy(false);
    if (r.ok) { setUser({ ...user, photo }); setMsg('Profile picture updated'); }
    else setMsg((await r.json()).error);
  }

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setMsg('Please choose an image file');
    if (file.size > 10 * 1024 * 1024) return setMsg('Image must be under 10 MB');
    try { await save(await resize(file)); } catch (er) { setMsg(er.message); }
    e.target.value = '';
  }

  return (
    <>
      <Header user={user} />
      <main className="page">
        <section className="card center">
          <Avatar user={user} size={140} />
          <h2>{user?.username}</h2>
          <p className="muted">{user?.email}</p>
          {msg && <div className="msg">{msg}</div>}
          <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
          <button className="btn" disabled={busy} onClick={() => input.current.click()}>
            {user?.photo ? 'Change picture' : 'Upload picture'}
          </button>
          {user?.photo && <button className="btn ghost" disabled={busy} onClick={() => save(null)}>Remove picture</button>}
        </section>
      </main>
    </>
  );
}