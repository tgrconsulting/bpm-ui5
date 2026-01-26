'use client';

// =============================================================================
// Imports
// =============================================================================
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

// UI5 Icons
import applicationIcon from '@ui5/webcomponents-icons/dist/it-system.js';
import dashboardIcon from '@ui5/webcomponents-icons/dist/bbyd-dashboard.js';
import homeIcon from '@ui5/webcomponents-icons/dist/home.js';
import logoutIcon from '@ui5/webcomponents-icons/dist/log.js';
import menuIcon from '@ui5/webcomponents-icons/dist/menu.js';
import processIcon from '@ui5/webcomponents-icons/dist/process.js';
import groupIcon from '@ui5/webcomponents-icons/dist/group-2.js';

// UI5 Components
import {
  Avatar,
  Bar,
  Button,
  SideNavigation,
  SideNavigationItem,
  ThemeProvider,
  type SideNavigationPropTypes,
} from '@ui5/webcomponents-react';

/**
 * FloorPlanPage Component
 * Provides the main application shell with a responsive header and side navigation.
 */
export default function FloorPlanPage({ children }: { children: React.ReactNode }) {
  // ---------------------------------------------------------------------------
  // Hooks & State
  // ---------------------------------------------------------------------------
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  /**
   * Derives user initials from the session name.
   */
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(session?.user?.name);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  /**
   * Triggers navigation when a side navigation item is selected.
   */
  const handleSelectionChange: SideNavigationPropTypes['onSelectionChange'] = (e) => {
    if (e.detail.item.text) {
      const targetRoute = e.detail.item.id;
      if (targetRoute) {
        router.push(targetRoute);
      }
    }
  };

  /**
   * Executes sign out and redirects to the login page.
   */
  const handleLogout = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log('Logging out...');
    await signOut({ callbackUrl: '/' });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ThemeProvider>
        {/* Header Section */}
        <Bar
          style={{ height: '3.5rem' }}
          design="Header"
          startContent={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                icon={menuIcon}
                onClick={() => setSideNavCollapsed(!sideNavCollapsed)}
              />
              <Button
                style={{ marginLeft: '0.5rem' }}
                icon={homeIcon}
                onClick={() => router.push('/')}
              />
            </div>
          }
          endContent={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                initials={initials}
                size="XS"
                title={session?.user?.name || 'User Profile'}
              />
              <Button
                style={{ marginLeft: '0.5rem' }}
                icon={logoutIcon}
                onClick={handleLogout}
                tooltip="Logout"
              />
            </div>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <img
              src="/images/bpm_logo.png"
              style={{ height: 'auto', width: 'auto' }}
              alt="Logo"
            />
          </div>
        </Bar>

        {/* Navigation & Content Body */}
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <SideNavigation
            collapsed={sideNavCollapsed}
            onSelectionChange={handleSelectionChange}
          >
            <SideNavigationItem
              id="/dashboard"
              text="Dashboard"
              icon={dashboardIcon}
              selected={pathname.startsWith('/dashboard')}
            />
            <SideNavigationItem
              id="/projects"
              text="Projects"
              icon={processIcon}
              selected={pathname.startsWith('/projects')}
            />
            <SideNavigationItem
              id="/applications"
              text="Applications"
              icon={applicationIcon}
              selected={pathname.startsWith('/applications')}
            />
            <SideNavigationItem
              id="/groups"
              text="Groups"
              icon={groupIcon}
              selected={pathname.startsWith('/groups')}
            />
          </SideNavigation>

          {/* Page Content Viewport */}
          <div
            style={{
              margin: '2px',
              flexGrow: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {children}
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
