import '@/app/UI5Registry';
import '@/app/globals.css';
import { AuthProvider } from '@/app/components/providers';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          data-ui5-config
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ theme: 'sap_horizon' }) }}
        />
      </head>
      <body>
        <AuthProvider>
          <main className="auth-stage">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
