'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Avatar({ user, size = 48 }) {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  if (user?.photo)
    return <img src={user.photo} alt="" style={style} className="shrink-0 rounded-full border-2 border-white bg-white object-cover shadow" />;
  return (
    <div style={style} className="grid shrink-0 place-items-center rounded-full border-2 border-white bg-blue-100 font-extrabold text-blue-700 shadow">
      {(user?.username || '?')[0].toUpperCase()}
    </div>
  );
}

const icons = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  table: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
};
const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d={d} /></svg>
);

export default function Header({ user }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }
  const tabs = [['/', 'Home', icons.home], ['/records', 'Records', icons.table], ['/profile', 'Profile', icons.user]];

  return (
    <>
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-700 to-blue-700 px-2 py-1 text-white  shadow-blue-900/20">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/profile" className="flex items-center gap-3 text-white no-underline">
            <Avatar user={user} size={40} />
            <div className="leading-tight">
              <small className="block text-sm text-blue-100"><strong className="text-sm">{user?.username ?? '...'}</strong></small>
             
            </div>
          </Link>
          <button onClick={logout} className="rounded-full  px-2 py-1 text-base ">
            Log out
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(15,23,42,.08)]">
        <div className="mx-auto flex max-w-3xl">
          {tabs.map(([href, label, d]) => {
            const on = path === href;
            return (
              <Link key={href} href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-sm font-bold transition ${on ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`rounded-full px-5 py-1 ${on ? 'bg-blue-100' : ''}`}><Icon d={d} /></span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}