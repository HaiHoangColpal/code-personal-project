import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Layout />
      </AppProvider>
    </ErrorBoundary>
  );
}
