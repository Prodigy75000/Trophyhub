// app/auth.tsx
import { Redirect } from "expo-router";

/**
 * This page serves as a "Landing Pad" for OAuth redirect_uris.
 * It prevents the user from seeing an "Unmatched Route" error.
 * The actual token logic is handled by the listeners in your hooks.
 */
export default function GlobalAuthRedirect() {
  return <Redirect href="/" />;
}
