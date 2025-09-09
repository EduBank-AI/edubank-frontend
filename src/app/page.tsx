"use client"

import NavBar from "~/components/NavBar";
import MouseFollow from "~/components/MouseFollow";

export default function Home() {
	return (
		<>
		<NavBar />
		<MouseFollow />
		<main className="flex min-h-screen flex-col items-center justify-center p-4">
			<h1 className="text-4xl font-bold">Welcome to EduBank</h1>
			<p className="mt-4 text-lg">Your educational banking solution.</p>
		</main>
		</>
	);
}
