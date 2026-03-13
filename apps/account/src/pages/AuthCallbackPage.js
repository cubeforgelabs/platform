import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
export function AuthCallbackPage() {
    const navigate = useNavigate();
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            navigate(data.session ? '/' : '/signin', { replace: true });
        });
    }, [navigate]);
    return (_jsx("div", { className: "min-h-screen bg-bg flex items-center justify-center", children: _jsx("p", { className: "text-sm text-text-dim", children: "Signing you in\u2026" }) }));
}
