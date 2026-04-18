import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import VisitBooking from "./pages/VisitBooking.tsx";
import Onboarding from "./pages/Onboarding.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/agentes" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/dashboard/agendamentos" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
