"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

import PasswordChecklist from 'react-password-checklist';

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

import { Loader2, UserPlus, Key, Check, X , EyeClosed, Eye} from "lucide-react";

import NavBar from "~/components/NavBar";
import MouseFollow from "~/components/MouseFollow";

const SignupPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, accessCode }),
    });

    const data = await res.json();
    console.log(data);
    setLoading(false);

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      toast.success("Account created successfully!");
      router.push("/profile");
    }
    else {
      toast.error(data.error) || "Failed to create account. Please try again.";
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
                <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Create Account
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Sign up to get started with the platform
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSignup} className="space-y-4">
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
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Password
                </Label>

                <div className="flex items-center mb-2 gap-2">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

                <PasswordChecklist
                  rules={["minLength", "specialChar", "lowercase"]}
                  minLength={8}
                  value={password}
                  onChange={(isValid) => setIsPasswordValid(isValid)}
                  messages={{
                    minLength: "at least 8 characters",
                    specialChar: "includes a special character",
                    lowercase: "includes a lowercase letter"
                  }}
                  iconComponents={{
                    ValidIcon: <Check size={22} className="text-green-500" />,
                    InvalidIcon: <X size={22} className="text-red-500" />,
                  }}
                />
              </div>

              <div>
                <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Access Code
                </Label>
                <Input 
                  id="accessCode" 
                  type="text"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="h-10"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Access code is required to create an account
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white mt-6"
                disabled={loading || !email.trim() || !password.trim() || !accessCode.trim() || !isPasswordValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 dark:border-gray-800 p-6">
            <div className="w-full text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Already have an account?
              </p>
              <Button 
                variant="outline" 
                className="w-full h-10 font-medium transition-colors" 
                disabled={loading}
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
    </>
  );
};

export default SignupPage;