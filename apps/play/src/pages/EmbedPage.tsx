import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, gameBundleUrl } from '../lib/supabase'
import type { Tables } from '@cubeforgelabs/auth'

type Game = Pick<Tables<'games'>, 'id' | 'title' | 'thumbnail_url' | 'bundle_path'>

export function EmbedPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [playing, setPlaying] = useState(false)
  const [srcdoc, setSrcdoc] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!id) return
    supabase.from('games').select('id, title, thumbnail_url, bundle_path').eq('id', id).single()
      .then(({ data }) => setGame(data as Game ?? null))
  }, [id])

  async function startPlaying() {
    if (!game?.bundle_path) return
    setLoading(true)
    supabase.rpc('increment_plays', { game_id: game.id })
    const { data } = await supabase.storage.from('games').download(game.bundle_path)
    if (data) {
      const slug = game.bundle_path.split('/')[0]
      const baseUrl = gameBundleUrl(`${slug}/`)
      const patchScript = `<script>
(function(){
  var NI=window.Image;
  function PI(w,h){var i=new NI(w,h);i.crossOrigin='anonymous';return i;}
  PI.prototype=NI.prototype;window.Image=PI;
  var oc=document.createElement.bind(document);
  document.createElement=function(t){var e=oc(t);if(t&&t.toLowerCase()==='img')e.crossOrigin='anonymous';return e;};
  var gains=[];
  var Ctx=window.AudioContext||window.webkitAudioContext;
  if(Ctx){
    function PCtx(){var c=new Ctx();var g=c.createGain();g.connect(c.destination);gains.push(g);Object.defineProperty(c,'destination',{get:function(){return g;}});return c;}
    PCtx.prototype=Ctx.prototype;
    window.AudioContext=PCtx;if(window.webkitAudioContext)window.webkitAudioContext=PCtx;
  }
  window.addEventListener('message',function(e){
    if(!e.data||e.data.cf===undefined)return;
    gains.forEach(function(g){g.gain.setValueAtTime(e.data.cf?0:1,0);});
  });
})();
<\/script>`
      let html = await data.text()
      html = html.replace('<head>', `<head><base href="${baseUrl}">${patchScript}`)
      setSrcdoc(html)
    }
    setLoading(false)
    setPlaying(true)
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    iframeRef.current?.contentWindow?.postMessage({ cf: next }, '*')
  }

  function toggleFullscreen() {
    iframeRef.current?.requestFullscreen?.()
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Game area */}
      <div className="flex-1 relative overflow-hidden">
        {playing && srcdoc ? (
          <iframe
            ref={iframeRef}
            {...{ srcdoc } as React.IframeHTMLAttributes<HTMLIFrameElement>}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen; autoplay"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
            title={game?.title ?? 'Game'}
          />
        ) : (
          /* Pre-play splash */
          <div className="absolute inset-0 flex items-center justify-center">
            {game?.thumbnail_url && (
              <img
                src={game.thumbnail_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <button
              onClick={startPlaying}
              disabled={!game?.bundle_path || loading}
              className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(79,195,247,0.9)', boxShadow: '0 0 40px rgba(79,195,247,0.4)' }}
            >
              {loading ? (
                <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
                  <polygon points="7 4 20 12 7 20 7 4" />
                </svg>
              )}
            </button>
            {game && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <p className="text-white text-sm font-semibold truncate">{game.title}</p>
              </div>
            )}
          </div>
        )}

        {/* Controls overlay — visible on hover */}
        {playing && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-1 px-2 py-1.5 opacity-0 hover:opacity-100 transition-opacity duration-150"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
          >
            <ControlBtn onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="2" y1="2" x2="22" y2="22"/>
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </ControlBtn>
            <ControlBtn onClick={toggleFullscreen} title="Fullscreen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </ControlBtn>
          </div>
        )}
      </div>

      {/* Branding bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ background: '#0b0d14', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs text-white/50 truncate">{game?.title ?? ''}</p>
        <a
          href={`https://play.cubeforge.dev/game/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-semibold text-white/40 hover:text-white/80 transition-colors shrink-0"
        >
          <img src="https://play.cubeforge.dev/favicon-96x96.png" alt="" className="w-3.5 h-3.5 rounded" />
          Play on CubeForge
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

function ControlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  )
}
