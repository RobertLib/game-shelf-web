import {
  Alert,
  Autocomplete,
  Button,
  DialogFooter,
  Input,
} from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { getFieldError } from "../../components/ui/form";
import { use } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router";
import { USER_CREATE, USER_UPDATE } from "../../graphql/mutations/users";
import { UserRole, type User } from "../../__generated__/graphql";
import SnackbarContext from "../../contexts/snackbar-context";

interface UserFormProps {
  onSuccess?: () => void;
  user?: User;
}

export default function UserForm({ onSuccess, user }: UserFormProps) {
  const navigate = useNavigate();

  const dict = getDictionary();

  const { enqueueSnackbar } = use(SnackbarContext);

  const [saveUser, { error, loading }] = useMutation(
    user ? USER_UPDATE : USER_CREATE,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      await saveUser({
        variables: {
          input: {
            email: formData.get("email") as string,
            role: formData.get("role") as UserRole,
            ...(user
              ? {
                  id: user.id,
                  password: formData.get("password") as string,
                  confirmPassword: formData.get("confirmPassword") as string,
                }
              : ({} as never)),
          },
        },
      });

      enqueueSnackbar(
        dict.form[`${user ? "update" : "create"}Success`],
        "success",
      );

      onSuccess?.();
      navigate(-1);
    } catch {
      enqueueSnackbar(dict.form[`${user ? "update" : "create"}Error`], "error");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Alert className="animate-fade-in mb-6" type="danger">
        {error?.message}
      </Alert>

      <Input
        autoComplete="email"
        defaultValue={user?.email}
        error={getFieldError(error, "email")}
        floating
        label={dict.user.email}
        name="email"
        placeholder="example@email.com"
        required
        type="email"
      />

      <Autocomplete
        asSelect
        defaultValue={user?.role ?? UserRole.User}
        error={getFieldError(error, "role")}
        label={dict.user.role}
        name="role"
        options={Object.entries(UserRole).map(([label, value]) => ({
          label,
          value,
        }))}
        required
      />

      {user && (
        <>
          <Input
            autoComplete="new-password"
            error={getFieldError(error, "password")}
            label={dict.user.password}
            name="password"
            type="password"
          />

          <Input
            autoComplete="new-password"
            error={getFieldError(error, "confirmPassword")}
            label={dict.user.confirmPassword}
            name="confirmPassword"
            type="password"
          />
        </>
      )}

      <DialogFooter>
        <Button className="w-full" loading={loading} type="submit">
          {dict.form.save}
        </Button>
      </DialogFooter>
    </form>
  );
}
