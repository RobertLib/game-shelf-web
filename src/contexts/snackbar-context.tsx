import { createContext, useCallback, useState } from "react";
import { Toast } from "../components/ui";
import { type ToastVariant } from "../components/ui/toast";

interface SnackbarContextType {
  enqueueSnackbar: (message: string, variant?: ToastVariant) => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  enqueueSnackbar: () => {},
});

export const SnackbarProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [toasts, setToasts] = useState<
    {
      id: string;
      message: string;
      variant?: ToastVariant;
    }[]
  >([]);

  const enqueueSnackbar = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      const id = Math.random().toString();
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    [],
  );

  const handleToastClose = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <SnackbarContext value={{ enqueueSnackbar }}>
      {children}

      <div className="fixed bottom-4 left-4 z-50 space-y-2.5">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            onClose={() => handleToastClose(toast.id)}
            variant={toast.variant}
          />
        ))}
      </div>
    </SnackbarContext>
  );
};

export default SnackbarContext;
