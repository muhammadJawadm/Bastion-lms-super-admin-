import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import ClientAdministrators from "./pages/ClientAdministrators";
import ContentRequests from "./pages/ContentRequests";
import ContentRequestDetail from "./pages/ContentRequestDetail";
import CourseLibrary from "./pages/CourseLibrary";
import CourseView from "./pages/CourseView";
import Forms from "./pages/Forms";
import FormView from "./pages/FormView";
import ClientDeliveries from "./pages/ClientDeliveries";
import Assignments from "./pages/Assignments";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import AuditLog from "./pages/AuditLog";
import SupportAccess from "./pages/SupportAccess";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true,                       element: <Dashboard />            },
      { path: "companies",                 element: <Companies />            },
      { path: "companies/:id",             element: <CompanyDetail />        },
      { path: "admins",                    element: <ClientAdministrators /> },
      { path: "content-requests",          element: <ContentRequests />      },
      { path: "content-requests/:id",      element: <ContentRequestDetail /> },
      { path: "courses",                   element: <CourseLibrary />        },
      { path: "courses/:id",               element: <CourseView />           },
      { path: "forms",                     element: <Forms />                },
      { path: "forms/:id",                 element: <FormView />             },
      { path: "deliveries",                element: <ClientDeliveries />     },
      { path: "billing",                   element: <Billing />              },
      { path: "analytics",                 element: <Analytics />            },
      { path: "audit-log",                 element: <AuditLog />             },
      { path: "support-access",            element: <SupportAccess />        },
      { path: "assignments",               element: <Assignments />          },
      { path: "settings",                  element: <Settings />             },
      { path: "profile",                   element: <Profile />              },
      { path: "notifications",             element: <Notifications />        },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
