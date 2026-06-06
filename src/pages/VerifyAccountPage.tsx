import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  verifyAccount,
  verifyAccountResend,
  extractErrorMessage,
} from "../api/client";

const inputClass =
  "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

export function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key") ?? "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    key ? "verifying" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    key ? null : "Invalid or missing verification link.",
  );

  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;

    verifyAccount(key)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(extractErrorMessage(err));
      });
  }, [key]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendError(null);
    setResendStatus("sending");
    try {
      await verifyAccountResend(resendEmail);
      setResendStatus("sent");
    } catch (err) {
      setResendError(extractErrorMessage(err));
      setResendStatus("error");
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && (
          <p className="text-slate-400">Verifying your account…</p>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 rounded-lg border border-green-700 bg-green-900/40 px-4 py-3 text-sm text-green-300">
              Your account has been verified. You can now log in.
            </div>
            <Link
              to="/login"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6 rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {errorMessage ?? "Verification failed."}
            </div>

            <p className="mb-4 text-sm text-slate-400">
              Request a new verification link:
            </p>

            {resendStatus === "sent" ? (
              <p className="text-sm text-green-300">
                Verification email sent. Please check your inbox.
              </p>
            ) : (
              <form onSubmit={handleResend} className="space-y-3 text-left">
                {resendError && (
                  <div className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-300">
                    {resendError}
                  </div>
                )}
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={resendStatus === "sending"}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {resendStatus === "sending"
                    ? "Sending…"
                    : "Resend verification email"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
