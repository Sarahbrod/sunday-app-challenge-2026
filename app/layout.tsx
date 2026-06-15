import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import ThemeRegistry from './ThemeRegistry';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Shameless Media — Creator Experimentation Platform',
  description: 'Experimentation and growth analytics for podcasters, YouTubers, and content creators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </head>
      <body>
        <ThemeRegistry>
          <ClientLayout>{children}</ClientLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}
