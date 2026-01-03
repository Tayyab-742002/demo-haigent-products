import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected and public routes
  const protectedRoutes = ["/schedule", "/sourcing", "/reference", "/onboarding", "/benefits", "/payroll", "/engee"];
  const publicRoutes = ["/login", "/forgot-password", "/jobs", "/book"];
  const path = request.nextUrl.pathname;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isRootPath = path === "/";

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing login with active session
  if (path === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/schedule";
    return NextResponse.redirect(url);
  }

  // Redirect root to dashboard if logged in, otherwise to login
  if (isRootPath) {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/schedule" : "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
