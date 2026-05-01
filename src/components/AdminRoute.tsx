import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "no-auth" | "no-admin">("loading");

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState("no-auth");
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: auth.user.id,
        _role: "admin",
      });
      if (error || !data) {
        setState("no-admin");
        return;
      }
      setState("allowed");
    })();
  }, []);

  if (state === "loading") {
    return (
      <div className="container py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (state === "no-auth") return <Navigate to="/login" replace />;
  if (state === "no-admin") {
    return (
      <div className="container py-24 text-center max-w-md">
        <h1 className="text-2xl font-display font-bold mb-2">Access denied</h1>
        <p className="text-muted-foreground">You need administrator privileges to view this page.</p>
      </div>
    );
  }
  return <>{children}</>;
}
