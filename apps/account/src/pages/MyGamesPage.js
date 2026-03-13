import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
export function MyGamesPage() {
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        supabase
            .from('games')
            .select('*')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
            setGames(data ?? []);
            setLoading(false);
        });
    }, [user]);
    async function togglePublished(game) {
        await supabase.from('games').update({ published: !game.published }).eq('id', game.id);
        setGames(prev => prev.map(g => g.id === game.id ? { ...g, published: !g.published } : g));
    }
    async function deleteGame(id) {
        if (!confirm('Delete this game?'))
            return;
        await supabase.from('games').delete().eq('id', id);
        setGames(prev => prev.filter(g => g.id !== id));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h1", { className: "text-xl font-semibold text-text", children: "My Games" }), _jsx("a", { href: "https://editor.cubeforge.dev", className: "rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-bg hover:bg-accent2 transition-colors", children: "+ New game" })] }), loading ? (_jsx("div", { className: "text-sm text-text-dim", children: "Loading\u2026" })) : games.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center border border-border rounded-2xl bg-surface", children: [_jsx("p", { className: "text-sm text-text-dim mb-2", children: "No games yet" }), _jsx("p", { className: "text-xs text-text-muted mb-4", children: "Build your first game in the editor and publish it here." }), _jsx("a", { href: "https://editor.cubeforge.dev", className: "rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent2 transition-colors", children: "Open Editor" })] })) : (_jsx("div", { className: "flex flex-col gap-3", children: games.map(game => (_jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-border bg-surface p-4", children: [game.thumbnail_url ? (_jsx("img", { src: game.thumbnail_url, alt: "", className: "w-14 h-10 rounded-lg object-cover shrink-0" })) : (_jsx("div", { className: "w-14 h-10 rounded-lg bg-surface2 shrink-0" })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-text truncate", children: game.title }), _jsxs("p", { className: "text-xs text-text-muted", children: [game.play_count, " plays"] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsx("button", { onClick: () => togglePublished(game), className: `text-xs px-3 py-1 rounded-lg border transition-colors ${game.published
                                        ? 'border-green/30 text-green bg-green/10 hover:bg-green/20'
                                        : 'border-border text-text-muted hover:text-text'}`, children: game.published ? 'Published' : 'Draft' }), _jsx("a", { href: `https://play.cubeforge.dev/games/${game.id}`, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-text-muted hover:text-text transition-colors", children: "View" }), _jsx("button", { onClick: () => deleteGame(game.id), className: "text-xs text-text-muted hover:text-red transition-colors", children: "Delete" })] })] }, game.id))) }))] }));
}
