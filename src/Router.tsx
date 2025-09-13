import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/protected-route";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import Home from "./pages/home";
import Layout from "./pages/layout";
import LoginPage from "./pages/auth/login";
import NotFound from "./pages/not-found";
import RegisterPage from "./pages/auth/register";
import ResetPasswordPage from "./pages/auth/reset-password";
import UserDetailPage from "./pages/users/user-detail";
import UsersPage from "./pages/users";
import VerifyAccountPage from "./pages/auth/verify-account";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/verify-account" element={<VerifyAccountPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
