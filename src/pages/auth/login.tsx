import { Alert, Button, Input, Panel } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useLocation, useNavigate } from "react-router";
import { type AuthError } from "../../lib/auth";
import { use, useActionState, useState } from "react";
import { User } from "lucide-react";
import logger from "../../utils/logger";
import SessionContext from "../../contexts/session-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const dict = getDictionary();

  const { login } = use(SessionContext);

  const [errors, setErrors] = useState<AuthError | null>(null);

  const successMessage = location.state?.message;

  const formState = async (_prevState: unknown, formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const responseError = await login(email, password);

      if (responseError) {
        setErrors(responseError);
        return responseError;
      }

      navigate("/");
    } catch (error) {
      logger.error(error);
    }
  };

  const [, formAction, pending] = useActionState(formState, null);

  return (
    <div className="container mx-auto max-w-md px-6 pt-[10vh] pb-8">
      <Panel rounded="2xl" shadow="lg">
        <h2 className="mb-1 text-2xl font-bold">{dict.auth.login.title}</h2>
        <p className="mb-5 text-gray-500">{dict.auth.login.subtitle}</p>
        <form
          action={formAction}
          className="space-y-4"
          onSubmit={() => {
            setErrors(null);
          }}
        >
          <Alert className="mb-6" type="success">
            {successMessage}
          </Alert>

          <Alert className="animate-fade-in mb-6" type="danger">
            {errors?.error}
          </Alert>

          <Input
            autoComplete="email"
            error={
              errors?.["field-error"]?.[0] === "email"
                ? errors["field-error"][1]
                : undefined
            }
            label={dict.auth.login.email}
            name="email"
            placeholder="example@email.com"
            required
            type="email"
          />

          <div className="-mb-5.5 text-right">
            <Link
              className="link text-primary-500 hover:text-primary-600 relative text-sm hover:underline"
              to="/forgot-password"
            >
              {dict.auth.login.forgotPassword}
            </Link>
          </div>

          <Input
            autoComplete="current-password"
            error={
              errors?.["field-error"]?.[0] === "password"
                ? errors["field-error"][1]
                : undefined
            }
            label={dict.auth.login.password}
            name="password"
            required
            type="password"
          />

          <Button
            className="mt-2 w-full"
            loading={pending}
            size="lg"
            type="submit"
          >
            <User className="mr-2 h-4 w-4" />
            {dict.auth.login.submit}
          </Button>

          <div className="mt-1 border-t border-gray-200 pt-6 text-center text-sm dark:border-gray-700">
            {dict.auth.login.noAccount}{" "}
            <Link
              className="link text-primary-500 hover:text-primary-600 font-semibold underline hover:no-underline"
              to="/register"
            >
              {dict.auth.login.register}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
