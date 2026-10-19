import './globals.css';

export const metadata = { title: 'Sugar & BP Tracker', description: 'Daily sugar and blood pressure diary' };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f766e' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}