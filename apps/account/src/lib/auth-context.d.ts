import type { Session, User } from '@cubeforgelabs/auth';
import type { Tables } from '@cubeforgelabs/auth';
type Profile = Tables<'profiles'>;
interface AuthContextValue {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
