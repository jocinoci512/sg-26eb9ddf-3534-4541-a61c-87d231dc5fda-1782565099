import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { authService } from "@/services/authService";
import { useRouter } from "next/router";
import { LogIn, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { user, error } = await authService.signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (user) {
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in to your account.",
      });
      router.push('/portal/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="py-16 min-h-screen flex items-center bg-muted/30">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full hero-gradient mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to access your customer portal
              </p>
            </div>

            <Card className="shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-gradient text-white"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}