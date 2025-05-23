import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ConnectionsPage from "@/pages/connections";
import BotControlPage from "@/pages/bot-control";
import AITradingPage from "@/pages/ai-trading";
import TradesPage from "@/pages/trades";
import NotificationsPage from "@/pages/notifications";
import SubscriptionsPage from "@/pages/subscriptions";
import CalculatorPage from "@/pages/calculator";
import AdminPage from "@/pages/admin";
import PaymentSelection from "@/pages/PaymentSelection";
import Checkout from "@/pages/checkout";
import Invoice from "@/pages/invoice";
import PaymentHistory from "@/pages/PaymentHistory";
import ContactUs from "@/pages/ContactUs";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/connections">
        <ProtectedRoute>
          <ConnectionsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/bot-control">
        <ProtectedRoute>
          <BotControlPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ai-trading">
        <ProtectedRoute>
          <AITradingPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/trades">
        <ProtectedRoute>
          <TradesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/notifications">
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/subscriptions">
        <ProtectedRoute>
          <SubscriptionsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payment/:planId">
        <ProtectedRoute>
          <PaymentSelection />
        </ProtectedRoute>
      </Route>
      
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      
      <Route path="/invoice">
        <ProtectedRoute>
          <Invoice />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payment-history">
        <ProtectedRoute>
          <PaymentHistory />
        </ProtectedRoute>
      </Route>
      
      <Route path="/contact">
        <ContactUs />
      </Route>
      
      <Route path="/calculator">
        <ProtectedRoute>
          <CalculatorPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
