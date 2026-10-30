import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Users from "./pages/Users";
import Enrollments from "./pages/Enrollments";
import Certificates from "./pages/Certificates";
import Uploads from "./pages/Uploads";
import CourseLibrary from "./pages/CourseLibrary";
import CourseView from "./pages/CourseView";
import Forms from "./pages/Forms";
import FormView from "./pages/FormView";
import Assignments from "./pages/Assignments";
import Billing from "./pages/Billing";
import BillingDetail from "./pages/BillingDetail";
import Analytics from "./pages/Analytics";
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
      { path: "users",                     element: <Users />                },
      { path: "admins",                    element: <Navigate to="/users" replace /> },
      { path: "enrollments",               element: <Enrollments />          },
      { path: "certificates",              element: <Certificates />         },
      { path: "uploads",                   element: <Uploads />              },
      { path: "courses",                   element: <CourseLibrary />        },
      { path: "courses/:id",               element: <CourseView />           },
      { path: "forms",                     element: <Forms />                },
      { path: "forms/:id",                 element: <FormView />             },
      { path: "billing",                   element: <Billing />              },
      { path: "billing/:companyId",        element: <BillingDetail />        },
      { path: "analytics",                 element: <Analytics />            },
      { path: "assignments",               element: <Assignments />          },
      { path: "settings",                  element: <Settings />             },
      { path: "profile",                   element: <Profile />              },
      { path: "support-access",            element: <Navigate to="/settings" replace /> },
      { path: "notifications",             element: <Notifications />        },
      { path: "*",                         element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
