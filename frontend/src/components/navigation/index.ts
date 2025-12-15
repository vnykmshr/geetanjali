/**
 * Navigation Components
 *
 * Centralized navigation module exports.
 */

// Types
export type { NavUser } from "./types";

// Configuration
export {
  NAV_ICONS,
  NAV_ITEMS,
  PRIMARY_CTA,
  isNavItemActive,
  getVisibleNavItems,
} from "./navConfig";

export type { NavItem, PrimaryCTA } from "./navConfig";

// Utilities
export { getInitials, getFirstName } from "./utils";

// Hooks
export { useClickOutside } from "./hooks";

// Components
export { Navbar } from "./Navbar";
export { NavLogo } from "./NavLogo";
export { UserMenu } from "./UserMenu";
export { DesktopNav } from "./DesktopNav";
export { MobileDrawer } from "./MobileDrawer";
