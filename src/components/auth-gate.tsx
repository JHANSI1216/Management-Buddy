import { useEffect, type ReactNode } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const PUBLIC = ["/auth", "/student"];
  const isAuthRoute = PUBLIC.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, isAuthRoute, navigate]);

  if (isAuthRoute) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
