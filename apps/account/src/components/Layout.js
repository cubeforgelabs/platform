import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
export function Layout() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    async function handleSignOut() {
        await signOut();
        navigate('/signin');
    }
    return (_jsxs("div", { className: "min-h-screen bg-bg flex flex-col", children: [_jsx("header", { className: "border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between", children: [_jsx("a", { href: "https://cubeforge.dev", className: "flex items-center gap-2", children: _jsx("span", { className: "text-accent font-bold tracking-tight text-base", children: "CubeForge" }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs text-text-dim hidden sm:block", children: profile?.display_name ?? profile?.username ?? '' }), profile?.avatar_url && (_jsx("img", { src: profile.avatar_url, alt: "", className: "w-7 h-7 rounded-full object-cover" })), _jsx("button", { onClick: handleSignOut, className: "text-xs text-text-muted hover:text-text transition-colors", children: "Sign out" })] })] }) }), _jsxs("div", { className: "flex flex-1 max-w-5xl mx-auto w-full px-4 py-8 gap-8", children: [_jsx("nav", { className: "w-44 shrink-0 flex flex-col gap-1", children: [
                            { to: '/', label: 'Profile', end: true },
                            { to: '/games', label: 'My Games' },
                            { to: '/settings', label: 'Settings' },
                        ].map(({ to, label, end }) => (_jsx(NavLink, { to: to, end: end, className: ({ isActive }) => `px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-surface2 text-text font-medium'
                                : 'text-text-dim hover:text-text hover:bg-surface2/50'}`, children: label }, to))) }), _jsx("main", { className: "flex-1 min-w-0", children: _jsx(Outlet, {}) })] })] }));
}
