import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Scanner from "@/pages/Scanner";
import BulkScan from "@/pages/BulkScan";
import Dashboard from "@/pages/Dashboard";
import BlockedSites from "@/pages/BlockedSites";
import Logs from "@/pages/Logs";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import AdminRoute from "@/components/AdminRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Extension from "@/pages/Extension";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/bulk" element={<BulkScan />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blocked" element={<BlockedSites />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/extension" element={<Extension />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
