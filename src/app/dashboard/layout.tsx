'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [userInitials, setUserInitials] = useState('A');
  const [fullName, setFullName] = useState('Admin User');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        let firstName = user.firstName || '';
        let lastName = user.lastName || '';
        
        if (firstName) {
          setUserName(firstName);
          setFullName(`${firstName} ${lastName}`.trim());
          
          // Get initials from first and last name
          const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ''}`.toUpperCase();
          setUserInitials(initials || 'A');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('storeId');
    
    // Redirect to login page
    router.push('/login');
  };

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
          <button 
            onClick={handleLogout}
            className={styles.logoutLink}
          >
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navLabel}>Logout</span>
          </button>
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
            <div className="relative" ref={dropdownRef}>
              <button 
                className={styles.userButton}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div className={styles.userAvatar}>
                  {userInitials}
                </div>
                <span className={styles.userName}>{fullName}</span>
              </button>
              
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                  <div className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                    <div className="font-medium">{fullName}</div>
                    <div className="truncate">{localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!).email : ''}</div>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span style={{ marginRight: '8px' }}>⚙️</span> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <span style={{ marginRight: '8px' }}>🚪</span> Sign out
                    </button>
                  </div>
                </div>
              )}
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