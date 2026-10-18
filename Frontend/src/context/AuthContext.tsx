import React, { createContext, useContext } from "react";
import {
  useUser as useClerkUser,
  useAuth as useClerkAuth,
  UserButton as ClerkUserButton,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  Show,
} from "@clerk/react";
import { defaultMockUser, meetingService } from "../services/meetingService";
import type { User } from "../types";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const isClerkConfigured = Boolean(
  CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.startsWith("pk_")
);

interface AuthContextType {
  user: User;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => void;
}

const FallbackAuthContext = createContext<AuthContextType>({
  user: defaultMockUser,
  isSignedIn: true,
  isLoaded: true,
  signOut: () => {},
});

export const useAppAuth = (): AuthContextType => {
  if (isClerkConfigured) {
    try {
      const { user: clerkUser, isLoaded } = useClerkUser();
      const { isSignedIn, signOut } = useClerkAuth();

      if (!clerkUser) {
        return {
          user: defaultMockUser,
          isSignedIn: Boolean(isSignedIn),
          isLoaded,
          signOut: () => signOut?.(),
        };
      }

      const mappedUser: User = {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "Connectra User",
        fullName: clerkUser.fullName || undefined,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        email: clerkUser.primaryEmailAddress?.emailAddress || "user@connectra.io",
        image: clerkUser.imageUrl,
        imageUrl: clerkUser.imageUrl,
        plan: "premium",
      };

      return {
        user: mappedUser,
        isSignedIn: Boolean(isSignedIn),
        isLoaded,
        signOut: () => signOut?.(),
      };
    } catch {
      // In case called outside provider
      return {
        user: defaultMockUser,
        isSignedIn: true,
        isLoaded: true,
        signOut: () => {},
      };
    }
  }

  return useContext(FallbackAuthContext);
};

export const AppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAppAuth();

  React.useEffect(() => {
    if (auth.user && auth.user.email) {
      meetingService.syncUserWithBackend(auth.user);
    }
  }, [auth.user?.id, auth.user?.email]);

  return <>{children}</>;
};

export { ClerkUserButton, ClerkSignIn, ClerkSignUp, Show };
