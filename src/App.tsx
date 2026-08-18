import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Users from "./pages/Users";
import CourseLibrary from "./pages/CourseLibrary";
import CourseView from "./pages/CourseView";
import TemplateLibrary from "./pages/TemplateLibrary";
import TemplateView from "./pages/TemplateView";
import Assignments from "./pages/Assignments";
import SubmittedForms from "./pages/SubmittedForms";
import Certificates from "./pages/Certificates";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true,                    element: <Dashboard />       },
      { path: "companies",              element: <Companies />       },
      { path: "companies/:id",          element: <CompanyDetail />   },
      { path: "users",                  element: <Users />           },
      { path: "courses",                element: <CourseLibrary />   },
      { path: "courses/:id",            element: <CourseView />      },
      { path: "templates",              element: <TemplateLibrary /> },
      { path: "templates/:id",          element: <TemplateView />    },
      { path: "assignments",            element: <Assignments />     },
      { path: "submissions",            element: <SubmittedForms />  },
      { path: "certificates",           element: <Certificates />    },
      { path: "billing",                element: <Billing />         },
      { path: "settings",               element: <Settings />        },
      { path: "profile",                element: <Profile />         },
      { path: "notifications",          element: <Notifications />   },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
