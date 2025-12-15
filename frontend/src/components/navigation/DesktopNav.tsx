import { Link } from "react-router-dom";
import {
  NAV_ITEMS,
  isNavItemActive,
  getVisibleNavItems,
} from "./navConfig";
import { UserMenu } from "./UserMenu";
import type { NavUser } from "./types";

interface DesktopNavProps {
  /** Current pathname for active state */
  pathname: string;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user object */
  user: NavUser | null;
  /** Logout handler */
  onLogout: () => void;
}

/**
 * Desktop navigation links and auth section
 *
 * Hidden on mobile (md:hidden), shows nav links and auth controls.
 */
export function DesktopNav({
  pathname,
  isAuthenticated,
  user,
  onLogout,
}: DesktopNavProps) {
  const visibleItems = getVisibleNavItems(NAV_ITEMS, isAuthenticated);

  return (
    <div className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
      {/* Navigation links */}
      {visibleItems.map((item) => {
        const isActive = isNavItemActive(item, pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              isActive
                ? "text-orange-700 bg-orange-100 shadow-sm"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      {/* Auth section */}
      {isAuthenticated ? (
        <div className="relative ml-2 pl-3 border-l border-gray-200">
          <UserMenu user={user} onLogout={onLogout} variant="desktop" />
        </div>
      ) : (
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
          <Link
            to="/login"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              pathname === "/login"
                ? "text-orange-700 bg-orange-100 shadow-sm"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
