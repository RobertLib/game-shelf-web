import { Navigate, Route, Routes } from "react-router";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthProvider";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { VerifyAccountPage } from "./pages/VerifyAccountPage";
import { GamesPage } from "./pages/GamesPage";
import { AddGamePage } from "./pages/AddGamePage";
import { EditGamePage } from "./pages/EditGamePage";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="grid min-h-screen grid-rows-[auto_1fr] bg-slate-950 text-slate-100">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-account" element={<VerifyAccountPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/games" element={<GamesPage />} />
                <Route path="/games/new" element={<AddGamePage />} />
                <Route path="/games/:id/edit" element={<EditGamePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/games" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
