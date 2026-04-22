import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import PropertyPage from "./pages/PropertyPage.tsx";
import PropertyPublic from "./pages/PropertyPublic.tsx";
import AnnouncementPublic from "./pages/AnnouncementPublic.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Agents from "./pages/Agents.tsx";
import Appointments from "./pages/Appointments.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import SubscriptionGuard from "./components/SubscriptionGuard.tsx";
import VisitBooking from "./pages/VisitBooking.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import AgencySelect from "./pages/AgencySelect.tsx";
import CheckoutReturn from "./pages/CheckoutReturn.tsx";
import AcceptInvite from "./pages/AcceptInvite.tsx";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/p/:slug" element={<PropertyPage />} />
              <Route path="/property/:id" element={<PropertyPublic />} />
              <Route path="/announcement/:id" element={<AnnouncementPublic />} />
              <Route path="/visit/:candidateId" element={<VisitBooking />} />
              <Route path="/select-agency" element={<ProtectedRoute><AgencySelect /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/checkout/success" element={<ProtectedRoute><CheckoutReturn /></ProtectedRoute>} />
              <Route path="/invite/:token" element={<AcceptInvite />} />
              <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><Dashboard /></SubscriptionGuard></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><SubscriptionGuard><Agents /></SubscriptionGuard></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><SubscriptionGuard><Appointments /></SubscriptionGuard></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
