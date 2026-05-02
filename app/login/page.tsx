"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, ArrowLeft, Loader2, Gift, Building2, Bike } from "lucide-react";
import { useAuth, type UserRole } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, demoLogin } = useAuth();
  const router = useRouter();

  const handleDemoLogin = (role: UserRole) => {
    demoLogin(role);
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Utensils className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl brand-name text-foreground">अन्नSetu</span>
      </div>

      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or try demo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => handleDemoLogin("donor")}
            >
              <Gift className="h-5 w-5 text-primary" />
              <span className="text-xs">Donor</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => handleDemoLogin("ngo")}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-xs">NGO</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => handleDemoLogin("volunteer")}
            >
              <Bike className="h-5 w-5 text-primary" />
              <span className="text-xs">Volunteer</span>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
