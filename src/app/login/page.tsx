"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

import { Button } from "~/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { toast } from "sonner"

import { Loader2, Lock, User, EyeClosed, Eye } from "lucide-react";

import MouseFollow from "~/components/MouseFollow";
import NavBar from "~/components/NavBar";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log(data);
    setLoading(false);

    // optionally store token
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      toast.success("Login successful!");
      router.push("/profile");
    }
    else {
      toast.error(data.error || "Login failed");
    }
  };

  return (
    <>
    <MouseFollow />
    <NavBar />
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-gray-300 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Sign In
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Enter your credentials to access your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="flex items-center mb-2 gap-2">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                    required
                  />
                  <EyeClosed 
                    size={20} 
                    className={`cursor-pointer text-gray-400 hover:text-white transition-color duration-300 ${showPassword ? "hidden" : "block"}`}
                    onClick={() => setShowPassword(true)}
                  />

                  <Eye 
                    size={20} 
                    className={`cursor-pointer text-gray-400 hover:text-white transition-color duration-300 ${showPassword ? "block" : "hidden"}`}
                    onClick={() => setShowPassword(false)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white mt-6"
                disabled={loading || !email.trim() || !password.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 dark:border-gray-800 p-6">
            <div className="w-full text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Don't have an account?
              </p>
              <Button 
                variant="outline" 
                className="w-full h-10 font-medium transition-colors" 
                disabled={loading}
                onClick={() => router.push("/signup")}
              >
                Create Account
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
    </>
  );
};

export default LoginPage;