import { Alert, Button, Input, Panel } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useNavigate } from "react-router";
import { type AuthError } from "../../lib/auth";
import { use, useActionState, useState } from "react";
import logger from "../../utils/logger";
import SessionContext from "../../contexts/session-context";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const dict = getDictionary();

  const { forgotPassword } = use(SessionContext);

  const [errors, setErrors] = useState<AuthError | null>(null);

  const formState = async (_prevState: unknown, formData: FormData) => {
    try {
      const email = formData.get("email") as string;

      const responseError = await forgotPassword(email);

      if (responseError) {
        setErrors(responseError);
        return responseError;
      }

      alert(dict.auth.forgotPassword.success);

      navigate("/");
    } catch (error) {
      logger.error(error);
    }
  };

  const [, formAction, pending] = useActionState(formState, null);

  return (
    <div className="container mx-auto max-w-md px-6 pt-[10vh] pb-8">
      <Panel rounded="2xl" shadow="lg">
        <h2 className="mb-1 text-2xl font-bold">
          {dict.auth.forgotPassword.title}
        </h2>
        <p className="mb-5 text-gray-500">
          {dict.auth.forgotPassword.subtitle}
        </p>
        <form
          action={formAction}
          className="space-y-4"
          onSubmit={() => {
            setErrors(null);
          }}
        >
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
            label={dict.auth.forgotPassword.email}
            name="email"
            placeholder="example@email.com"
            required
            type="email"
          />

          <Button className="mt-2 w-full" loading={pending} type="submit">
            {dict.auth.forgotPassword.submit}
          </Button>

          <div className="mt-1 border-t border-gray-200 pt-6 text-center text-sm dark:border-gray-700">
            {dict.auth.forgotPassword.backTo}{" "}
            <Link
              className="link text-primary-500 hover:text-primary-600 font-semibold underline hover:no-underline"
              to="/login"
            >
              {dict.auth.forgotPassword.login}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
