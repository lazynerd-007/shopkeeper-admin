'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';

interface SidebarLinkProps {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}

const SidebarLink = ({ href, icon, label, active }: SidebarLinkProps) => {
  return (
    <Link 
      href={href}
      className={`${styles.navLink} ${active ? styles.navLinkActive : styles.navLinkInactive}`}
    >
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{label}</span>
    </Link>
  );
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`${styles.dashboardContainer} ${!isSidebarOpen ? styles.sidebarHidden : ''}`}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <Image 
              src="/logo.svg" 
              alt="myShopKeeper Logo" 
              width={32} 
              height={32} 
              priority
            />
            <span className={styles.logoText}>myShopKeeper</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className={`md:hidden ${styles.closeButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navList}>
          <SidebarLink 
            href="/dashboard" 
            icon="📊" 
            label="Dashboard" 
            active={pathname === '/dashboard'} 
          />
          <SidebarLink 
            href="/dashboard/merchants" 
            icon="🏪" 
            label="Merchants" 
            active={pathname === '/dashboard/merchants'} 
          />
          <SidebarLink 
            href="/dashboard/sales" 
            icon="💰" 
            label="Sales" 
            active={pathname === '/dashboard/sales'} 
          />
          <SidebarLink 
            href="/dashboard/settings" 
            icon="⚙️" 
            label="Settings" 
            active={pathname === '/dashboard/settings'} 
          />
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link 
            href="/login"
            className={styles.logoutLink}
          >
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navLabel}>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden ${styles.menuButton}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          </div>
          <div className={styles.headerRight}>
            <div className="relative">
              <button className={styles.userButton}>
                <div className={styles.userAvatar}>
                  A
                </div>
                <span className={styles.userName}>Admin User</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}