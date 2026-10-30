import {
  FaThLarge, FaUsers, FaBuilding,
  FaCog, FaBell,
  FaGraduationCap, FaClipboardList,
  FaFileInvoiceDollar, FaChartBar,
  FaUserGraduate, FaCertificate, FaCloudUploadAlt,
} from "react-icons/fa";

export interface NavGroup {
  label: string | null;
  preview?: boolean;
  items: { label: string; path: string; icon: React.ReactNode }[];
}

export const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Dashboard", path: "/", icon: <FaThLarge size={15} /> },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Companies", path: "/companies", icon: <FaBuilding size={15} /> },
      { label: "Users",     path: "/users",     icon: <FaUsers size={15} />    },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Courses", path: "/courses", icon: <FaGraduationCap size={15} /> },
      { label: "Forms",   path: "/forms",   icon: <FaClipboardList size={15} /> },
    ],
  },
  {
    label: "Learning Records",
    items: [
      { label: "Enrollments",  path: "/enrollments",  icon: <FaUserGraduate size={15} />   },
      { label: "Certificates", path: "/certificates", icon: <FaCertificate size={15} />    },
      { label: "Uploads",      path: "/uploads",      icon: <FaCloudUploadAlt size={15} /> },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Billing", path: "/billing", icon: <FaFileInvoiceDollar size={15} /> },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", path: "/settings", icon: <FaCog size={15} /> },
    ],
  },
  {
    // Screens with no backend API yet — still mock data, flagged with a banner in Layout.
    label: "Preview · no API yet",
    preview: true,
    items: [
      { label: "Analytics",     path: "/analytics",     icon: <FaChartBar size={15} />          },
      { label: "Notifications", path: "/notifications", icon: <FaBell size={15} />              },
    ],
  },
];

const PREVIEW_PREFIXES = [
  ...navGroups.filter((g) => g.preview).flatMap((g) => g.items.map((i) => i.path)),
  "/assignments",
];

export function isPreviewPath(pathname: string): boolean {
  return PREVIEW_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
