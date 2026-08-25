import { clerkMiddleware } from "@clerk/nextjs/server";

const PROTECTED_PREFIXES = [
	"/dashboard",
	"/projects",
	"/team",
	"/analytics",
	"/calendar",
	"/settings",
	"/__clerk/:path*",
];

export default clerkMiddleware(async (auth, req) => {
	const { pathname } = req.nextUrl;

	const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
		pathname.startsWith(prefix),
	);

	if (isProtectedRoute) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
		"/__clerk/(.*)",
	],
};
