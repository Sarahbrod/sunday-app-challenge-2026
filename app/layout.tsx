import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import ThemeRegistry from './ThemeRegistry';

export const metadata: Metadata = {
  title: 'Sunday — Restaurant Operations',
  description: 'Operational decision support for premium restaurant groups',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
