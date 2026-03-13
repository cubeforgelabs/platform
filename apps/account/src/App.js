import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth-context';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyGamesPage } from './pages/MyGamesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Layout } from './components/Layout';
function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { className: "flex items-center justify-center min-h-screen text-text-dim text-sm", children: "Loading\u2026" });
    if (!user)
        return _jsx(Navigate, { to: "/signin", replace: true });
    return _jsx(_Fragment, { children: children });
}
export function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/signin", element: _jsx(SignInPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpPage, {}) }), _jsx(Route, { path: "/auth/callback", element: _jsx(AuthCallbackPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(RequireAuth, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "games", element: _jsx(MyGamesPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) })] })] }));
}
