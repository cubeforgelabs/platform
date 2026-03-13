import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
export function ProfilePage() {
    const { profile, user, refreshProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
    const [username, setUsername] = useState(profile?.username ?? '');
    const [bio, setBio] = useState(profile?.bio ?? '');
    const [website, setWebsite] = useState(profile?.website ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        const { error } = await supabase
            .from('profiles')
            .update({ display_name: displayName, username, bio, website })
            .eq('id', user.id);
        setSaving(false);
        if (error) {
            setError(error.message);
            return;
        }
        await refreshProfile();
        setEditing(false);
    }
    if (!profile)
        return null;
    return (_jsxs("div", { className: "max-w-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-xl font-semibold text-text", children: "Profile" }), !editing && (_jsx("button", { onClick: () => {
                            setDisplayName(profile.display_name ?? '');
                            setUsername(profile.username);
                            setBio(profile.bio ?? '');
                            setWebsite(profile.website ?? '');
                            setEditing(true);
                        }, className: "text-xs text-accent hover:underline", children: "Edit" }))] }), _jsxs("div", { className: "flex items-center gap-4 mb-6", children: [profile.avatar_url ? (_jsx("img", { src: profile.avatar_url, alt: "", className: "w-16 h-16 rounded-2xl object-cover" })) : (_jsx("div", { className: "w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-2xl font-bold text-accent", children: (profile.display_name ?? profile.username)[0]?.toUpperCase() })), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text", children: profile.display_name ?? profile.username }), _jsxs("p", { className: "text-xs text-text-muted", children: ["@", profile.username] }), _jsx("p", { className: "text-xs text-text-muted mt-0.5", children: user?.email })] })] }), editing ? (_jsxs("form", { onSubmit: handleSave, className: "flex flex-col gap-3", children: [_jsx(Field, { label: "Display name", children: _jsx("input", { value: displayName, onChange: e => setDisplayName(e.target.value), className: "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40" }) }), _jsx(Field, { label: "Username", children: _jsx("input", { value: username, onChange: e => setUsername(e.target.value), required: true, className: "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40" }) }), _jsx(Field, { label: "Bio", children: _jsx("textarea", { value: bio, onChange: e => setBio(e.target.value), rows: 3, className: "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40 resize-none" }) }), _jsx(Field, { label: "Website", children: _jsx("input", { value: website, onChange: e => setWebsite(e.target.value), type: "url", placeholder: "https://", className: "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40" }) }), error && _jsx("p", { className: "text-xs text-red", children: error }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { type: "submit", disabled: saving, className: "rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent2 transition-colors disabled:opacity-50", children: saving ? 'Saving…' : 'Save' }), _jsx("button", { type: "button", onClick: () => setEditing(false), className: "rounded-xl border border-border px-5 py-2 text-sm text-text-dim hover:text-text transition-colors", children: "Cancel" })] })] })) : (_jsxs("div", { className: "flex flex-col gap-3", children: [profile.bio && (_jsx("div", { className: "rounded-xl bg-surface2 border border-border px-4 py-3", children: _jsx("p", { className: "text-sm text-text-dim", children: profile.bio }) })), profile.website && (_jsx("a", { href: profile.website, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-accent hover:underline", children: profile.website })), _jsxs("p", { className: "text-xs text-text-muted", children: ["Member since ", new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })] })] }))] }));
}
function Field({ label, children }) {
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs text-text-muted", children: label }), children] }));
}
