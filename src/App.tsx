import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { lazy, useEffect } from "react";
import { AppProvider } from "./hooks/useApp";
import { Layout } from "./components/layout/Layout";
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Leads = lazy(() =>
  import("./pages/Leads").then((m) => ({ default: m.Leads })),
);
const LeadDetail = lazy(() =>
  import("./pages/LeadDetail").then((m) => ({ default: m.LeadDetail })),
);
const Marketing = lazy(() =>
  import("./pages/Marketing").then((m) => ({ default: m.Marketing })),
);
const ResponsibleAI = lazy(() =>
  import("./pages/ResponsibleAI").then((m) => ({ default: m.ResponsibleAI })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `SmartLead AI · ${pathname.startsWith("/leads/") ? "Lead profile" : { "/": "Overview", "/leads": "Lead management", "/marketing": "Marketing automation", "/responsible-ai": "Responsible AI", "/settings": "Settings & integrations" }[pathname] || "Page not found"}`;
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <RouteEffects />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="responsible-ai" element={<ResponsibleAI />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <div className="page empty-state">
                  <h1>Page not found</h1>
                  <p>Let’s get you back to your workspace.</p>
                  <Link className="text-link" to="/">
                    Go to Overview
                  </Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
