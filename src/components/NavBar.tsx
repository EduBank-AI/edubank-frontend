"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { User } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "~/components/ui/navigation-menu"

export default function NavBar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="w-full mb-4 bg-transparent pb-3 border-b border-gray-400 dark:border-gray-800 flex items-center justify-between">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className="hover:bg-transparent">
                    <img onClick={() => router.push("/")} src="/logo.png" alt="Logo" className="h-10 cursor-pointer" />
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavigationMenu>
              <NavigationMenuList>
                {isLoggedIn ? (
                  <NavigationMenuItem>
                    <div
                      onClick={() => router.push("/profile")}
                      className="cursor-pointer p-2 rounded-full hover:scale-105 hover:bg-gray-100 hover:shadow-lg transition-all duration-300 bg-transparent dark:hover:bg-gray-800 backdrop-blur-md"
                    >
                      <User className="dark:text-white" size={28} />
                    </div>
                  </NavigationMenuItem>
                ) : (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        href="/login"
                        className="hover:text-blue-400 dark:hover:text-indigo-300 font-medium transition duration-200"
                      >
                        Login
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        href="/signup"
                        className="hover:text-blue-400 dark:hover:text-indigo-300 font-medium transition duration-200"
                      >
                        Sign Up
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}