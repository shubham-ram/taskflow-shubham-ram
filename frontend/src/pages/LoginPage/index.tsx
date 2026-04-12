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
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";
import getField from "@/form/getField";
import useLoginForm from "./hooks/useLoginForm";
import loginControls from "./config/controls";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, errors } = useLoginForm();

  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/projects", { replace: true });
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your TaskFlow account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {loginControls.map((config) => {
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
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
