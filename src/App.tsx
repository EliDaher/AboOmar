import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

// Import pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import UnauthorizedPage from "./pages/Unauthorized";
import CustomerDetails from "./pages/CustomerDetails";
import Balance from "./pages/Balance";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});


const App = () => (

  

  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route 
              path="/AboOmar/dashboard" 
              element={
                <PrivateRoute  allowedRoles={["admin"]}>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/AboOmar/balance" 
              element={
                <PrivateRoute  allowedRoles={["admin"]}>
                  <Balance />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/AboOmar/users" 
              element={
                <PrivateRoute  allowedRoles={["admin"]}>
                  <Users />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/AboOmar/CustomerDetails/:id" 
              element={
                <PrivateRoute  allowedRoles={["admin"]}>
                  <CustomerDetails />
                </PrivateRoute>
              } 
            />

            <Route path="/AboOmar/unauthorized" element={<UnauthorizedPage/>}/>
            <Route path="/AboOmar/login" element={<Login/>}/>
            <Route path="/AboOmar/signUp" element={<SignUp/>}/>
            <Route
              path="/AboOmar/settings"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Settings Page</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
