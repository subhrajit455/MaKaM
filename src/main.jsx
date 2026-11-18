import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer, Flip } from "react-toastify";
import store from "./components/stores/Store";
import { Provider } from "react-redux";
import { AuthProvider } from "./store/AuthProvider";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
      staleTime: 30 * 1000,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <ToastContainer limit={1} autoClose={2000} pauseOnHover theme="dark" transition={Flip} />
          <App />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
    </QueryClientProvider>
  </BrowserRouter>,
);
