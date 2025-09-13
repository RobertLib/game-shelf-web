import { DrawerProvider } from "./contexts/drawer-context";
import { SessionProvider } from "./contexts/session-context";
import { SnackbarProvider } from "./contexts/snackbar-context";
import ErrorBoundary from "./error-boundary";
import Router from "./Router";

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <SnackbarProvider>
          <DrawerProvider>
            <Router />
          </DrawerProvider>
        </SnackbarProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
