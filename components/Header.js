'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Avatar({ user, size = 48 }) {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  if (user?.photo) return <img src={user.photo} alt="" className="avatar" style={style} />;
  return <div className="avatar ph" style={style}>{(user?.username || '?')[0].toUpperCase()}</div>;
}

export default function Header({ user }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }
  const tabs = [['/', 'Home'], ['/records', 'Records'], ['/profile', 'Profile']];
  return (
    <header className="topbar">
      <div className="topline">
        <Link href="/profile" className="chip">
          <Avatar user={user} />
          <div>
            <small>Welcome</small>
            <strong>{user?.username ?? '...'}</strong>
          </div>
        </Link>
        <button className="logout" onClick={logout}>Log out</button>
      </div>
      <nav className="tabs">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} className={path === href ? 'on' : ''}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}