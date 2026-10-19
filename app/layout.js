import './globals.css';

export const metadata = { title: 'Sugar & BP Tracker', description: 'Daily sugar and blood pressure diary' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#2563eb' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-lg leading-relaxed text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}