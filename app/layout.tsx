import './UI5Registry';
import './globals.css';
import { AuthProvider } from '@/app/components/providers';
import { ThemeProvider } from '@ui5/webcomponents-react';
import UI5HybridWrapper from './components/ui5-client-layout-loader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          data-ui5-config
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              theme: 'sap_horizon',
            }),
          }}
        />
      </head>
      <body>
        <div className="appShell">
          <AuthProvider>
            <ThemeProvider>
              <UI5HybridWrapper>{children}</UI5HybridWrapper>
            </ThemeProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
