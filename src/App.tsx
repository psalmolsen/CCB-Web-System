import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import IndexPage from "./pages/IndexPage";
import CnfPage from "./pages/CnfPage";
import OringPage from "./pages/OringPage";
import PelletsPage from "./pages/PelletsPage";
import StationConsumptionPage from "./pages/StationConsumptionPage";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthed = sessionStorage.getItem("ccb_authed") === "1";
  if (!isAuthed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <IndexPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cnf"
            element={
              <RequireAuth>
                <CnfPage />
              </RequireAuth>
            }
          />
          <Route
            path="/oring"
            element={
              <RequireAuth>
                <OringPage />
              </RequireAuth>
            }
          />
          <Route
            path="/pellets"
            element={
              <RequireAuth>
                <PelletsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/station-consumption"
            element={
              <RequireAuth>
                <StationConsumptionPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
