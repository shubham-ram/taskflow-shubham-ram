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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
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
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
