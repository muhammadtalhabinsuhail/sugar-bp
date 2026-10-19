'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useUser() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d ? setUser(d.user) : router.replace('/login')));
  }, [router]);
  return [user, setUser];
}