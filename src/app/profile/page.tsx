"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { toast } from "sonner"

import { User, Upload, LogOut, Mail } from "lucide-react";

import MouseFollow from "~/components/MouseFollow";
import NavBar from "~/components/NavBar";

const ProfilePage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem("token");
    if (!token || token === "") {
      router.push("/login");
      return;
    }

    // Get email from localStorage
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      setEmail(userEmail);
    } else {
      // If no email in localStorage, redirect to login
      toast.error("Session expired. Please login again.");
      router.push("/login");
    }
  }, [router]);

  const handleGoToUploader = () => {
    router.push("/uploader");
  };

  const handleLogout = () => {
    setLoading(true);
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <>
    <MouseFollow />
    <NavBar />

    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and access your tools
          </p>
        </div>

        {/* Profile Info Card */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl mb-6">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Account Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Your current account details
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Email Address
                  </p>
                  <p className="text-lg text-gray-900 dark:text-gray-100 font-medium">
                    {email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Access your tools and manage your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Go to Uploader Button */}
              <Button
                onClick={handleGoToUploader}
                className="w-full h-12 font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="mr-2 h-5 w-5" />
                Go to File Uploader
              </Button>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                disabled={loading}
                variant="outline"
                className="w-full h-11 font-medium transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:border-red-800 dark:hover:text-red-400"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;