import './globals.css';
import Navbar from '../components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}