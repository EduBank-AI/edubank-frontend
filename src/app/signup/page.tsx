"use client";

import { useState } from "react";
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

import { Loader2 } from "lucide-react";

const SignupPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, accessCode }),
    });

    const data = await res.json();
    console.log(data);
    setLoading(false);

    if (res.ok) {
      localStorage.setItem("token", data.token);
      toast.success("Signup successful!");
      router.push("/uploader");
    }
    else {
      toast.error(data.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-19">
      <Card className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Signup for an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Access Code</Label>
                <Input 
                  id="code" 
                  type="text" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 text-white hover:bg-purple-700"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>


          <Button 
            variant="outline" 
            className="w-full cursor-pointer" 
            disabled={loading}
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;