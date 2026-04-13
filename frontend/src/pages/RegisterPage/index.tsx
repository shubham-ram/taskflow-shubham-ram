import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";
import getField from "@/form/getField";
import useRegisterForm from "./hooks/useRegisterForm";
import registerControls from "./config/controls";

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setError, errors } = useRegisterForm();

  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      navigate("/projects", { replace: true });
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      const resp = error.response?.data;
      if (resp?.fields) {
        Object.entries(resp.fields).forEach(([field, message]) => {
          setError(field as "name" | "email" | "password", { message });
        });
      } else {
        toast.error(resp?.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <FolderKanban className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            TaskFlow
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your projects with clarity
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Get started with TaskFlow</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {registerControls.map((config) => {
                const Element = getField(config.type);
                if (!Element) return null;
                return (
                  <Element
                    key={config.name}
                    {...config}
                    control={control}
                    errors={errors}
                  />
                );
              })}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
