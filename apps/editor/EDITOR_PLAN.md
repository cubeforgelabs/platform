# CubeForge Visual Editor — Implementation Plan

## Vision

A visual drag-and-drop game editor targeting kids and beginners, with a code view for power users.
Built on top of the existing Monaco playground. Ships at `editor.cubeforge.dev`.

### Three-panel layout (Retool-style)
- **Left** — component palette + scene hierarchy tree
- **Center** — live canvas (drag/select gizmos) OR Monaco code editor (toggleable)
- **Right** — properties inspector, auto-generated from component registry

### Two views, one source of truth
- **Visual mode** (default) — drag and drop, no code visible
- **Code mode** — Monaco showing generated TSX, fully editable
- Both views read/write CSX. Switching between them is lossless.

---

## CSX — CubeForge Scene Format (internal IR)

CSX is the single source of truth for every project. The user never sees it directly.

```json
{
  "$csx": "1.0",
  "meta": {
    "name": "My Platformer",
    "created_at": "2026-03-13T00:00:00Z",
    "updated_at": "2026-03-13T00:00:00Z"
  },
  "game": {
    "width": 900,
    "height": 560,
    "gravity": 980,
    "debug": false
  },
  "world": {
    "background": "#12131f"
  },
  "entities": [
    {
      "id": "e_abc123",
      "name": "Player",
      "x": 100,
      "y": 420,
      "components": [
        { "type": "RigidBody",   "props": { "mass": 1, "lockRotation": true, "gravityScale": 1 } },
        { "type": "BoxCollider", "props": { "width": 32, "height": 32, "isTrigger": false } },
        { "type": "Sprite",      "props": { "src": "player.png", "width": 32, "height": 32 } },
        { "type": "Script",      "props": { "file": "Player.tsx" } }
      ],
      "children": []
    }
  ],
  "files": [
    { "name": "Player.tsx", "content": "// gameplay logic" }
  ]
}
```

### Key properties
- **Versioned** via `$csx` — enables migrations when new components are added
- **Diffable** — auto-save sends diffs, enables undo/redo per entity
- **Portable** — exportable as a `.cubeforge` project file
- **AI-friendly** — AI game generation outputs CSX, not raw TSX
- **Analytics** — DB is queryable for component usage, entity counts, etc.
- `files[]` holds raw script code — gameplay logic that can't be visually represented

---

## Component Registry

Every supported component has a registry entry with:
- `defaultProps` — initial values when dropped onto canvas
- `schema[]` — drives the properties inspector UI
- `codegen(props)` — produces the TSX string for code-gen

### Supported components

| Component | Key Props |
|-----------|-----------|
| `RigidBody` | mass, lockRotation, gravityScale, isKinematic, sleepThreshold |
| `BoxCollider` | width, height, offsetX, offsetY, isTrigger, layer, mask |
| `CircleCollider` | radius, offsetX, offsetY, isTrigger, layer, mask |
| `CapsuleCollider` | width, height, isTrigger, layer, mask |
| `Sprite` | src, width, height, flipX, flipY, opacity, anchor |
| `Animation` | src, frameWidth, frameHeight, fps, loop, autoPlay, states |
| `Camera2D` | followEntity, smoothing, zoom, offsetX, offsetY, bounds |
| `Script` | file (ref into files[]) |
| `Text` | content, fontSize, color, fontFamily, align |
| `Shape` | shape (rect/circle/line), color, width, height, radius |
| `ParticleEmitter` | preset, rate, color, speed, lifetime |
| `Trail` | length, color, width |
| `SoundEmitter` | src, volume, loop, autoPlay |
| `Tilemap` | src, tileWidth, tileHeight, collisionLayer |

Registry lives at `src/lib/componentRegistry.ts`. Adding a new engine component = one new registry entry, zero changes to editor core.

---

## Data Flow

```
CSX (source of truth, saved to projects table)
  │
  ├──► code-gen ──────────► TSX  (Monaco view)
  │                           └──► esbuild/sucrase ──► runnable bundle
  │
  ├──► visual editor ─────► canvas gizmos, hierarchy tree, inspector
  │
  └──► publish pipeline ──► compile ──► Storage upload ──► games table
```

### View switching
- Visual → Code: run code-gen, show TSX in Monaco
- Code → Visual: run TSX parser back to CSX, update scene tree
- Scripts (`files[]`) are always code — no visual representation

---

## Storage Layout

```
Supabase Storage
├── editor-assets/          ← NEW, private bucket
│   └── {user_id}/
│       └── {project_id}/
│           ├── sprites/
│           └── audio/
│
└── games/                  ← existing public bucket
    └── {game_id}/
        └── index.html      ← upserted on every publish
```

`is_official` flag on the `games` table distinguishes team games from community-built games. No path-level separation needed.

---

## Database

| Table | Status | Notes |
|-------|--------|-------|
| `projects` | exists | `data` JSON column stores CSX — no schema change needed |
| `games` | exists | no change |
| `editor-assets` bucket | **missing** | create with private RLS locked to `user_id` |

### Migration needed
1. Create `editor-assets` Storage bucket (private)
2. RLS policy: `storage.objects` — users can only read/write their own `{user_id}/` prefix

---

## Project Lifecycle

```
Dashboard
  └── listProjects()            → show all user projects (multiple per user)
  └── createProject(name)       → INSERT projects row with empty CSX template
        ↓
Editor (open project)
  └── loadProject(id)           → fetch CSX from projects table
  └── auto-save (2s debounce)   → UPDATE projects SET data = csx WHERE id = ?
        ↓
Publish
  └── compile CSX → TSX → bundle (client-side, sucrase + esbuild-wasm)
  └── Storage.upload('games/{game_id}/index.html', bundle, { upsert: true })
  └── games table upsert → { bundle_path, author_id, title, description, tags, thumbnail_url }
        ↓
Re-publish (same project)
  └── same path, same game_id — upsert overwrites
  └── CDN cache busted by Supabase version param
```

---

## Publish Modal fields

When user hits Publish (first time or update):
- Title (required)
- Description
- Tags (multi-select)
- Thumbnail — screenshot of canvas or manual upload
- Visibility — Public / Unlisted

---

## Build Stages

### Stage 1 — Auth integration (editor)
Replace raw `supabase.auth.getUser()` with full auth context.

- Add `AuthProvider` + `useAuth` hook mirroring the account app
- Load profile (username, avatar_url) alongside session
- Toolbar: show avatar image or initials from `display_name ?? username`, not email
- Sign in link: `https://account.cubeforge.dev/signin?redirect_to=https://editor.cubeforge.dev`
- After OAuth callback, account app redirects back to editor
- Check `username_confirmed` — if false, redirect to `https://account.cubeforge.dev/setup-username`
- `RequireAuth` wrapper for project routes

**Files**
- New: `src/lib/auth-context.tsx`
- Modified: `src/App.tsx` — wrap with AuthProvider, add RequireAuth
- Modified: `src/App.tsx` toolbar — replace email initial with profile avatar

---

### Stage 2 — CSX data model + component registry

Define the CSX TypeScript types and the component registry.

- New: `src/lib/csx.ts` — TypeScript types for `CsxDocument`, `CsxEntity`, `CsxComponent`
- New: `src/lib/componentRegistry.ts` — registry with schema + defaultProps + codegen per component
- New: `src/lib/csxUtils.ts` — helpers: `createEntity()`, `addComponent()`, `removeComponent()`, `updateComponentProp()`

---

### Stage 3 — Code-gen + CSX↔TSX bridge

- New: `src/lib/codegen.ts` — `csxToTsx(doc: CsxDocument): VFile[]`
- New: `src/lib/parser.ts` — `tsxToCsx(files: VFile[]): CsxDocument` (best-effort, scripts stay as files[])
- Integrate into editor: visual edits trigger codegen, Monaco edits trigger parser
- Auto-save: debounced 2s write of CSX to `projects` table on every change
- Toolbar: `Saving…` → `Saved 12:34` indicator

---

### Stage 4 — Project dashboard

Replace the single-editor entry point with a projects dashboard.

- New route `/` → `DashboardPage` — grid of user projects
- New route `/project/:id` → editor (existing)
- New route `/project/new` → create project modal → redirect to editor
- `DashboardPage`: project cards with name, last saved, thumbnail preview
- Delete project (with confirmation)

---

### Stage 5 — Scene hierarchy + properties inspector

The left and right panels. Center remains Monaco for now.

- New: `src/components/HierarchyPanel.tsx`
  - Tree view of CSX entities
  - Add entity button → pick name → appended to entities[]
  - Click entity → sets `selectedEntityId`
  - Drag to reorder (within same parent)
  - Right-click → Rename / Duplicate / Delete
- New: `src/components/InspectorPanel.tsx`
  - Reads `selectedEntity.components`
  - Renders fields from `componentRegistry[type].schema`
  - Field types: number (input), boolean (toggle), string (input), color (color picker), file (asset picker from editor-assets), entity-ref (dropdown of entity names)
  - Add component button → dropdown of all registry types
  - Remove component button per component

**Field schema types**
```ts
type FieldSchema =
  | { key: string; type: 'number'; min?: number; max?: number; step?: number }
  | { key: string; type: 'boolean' }
  | { key: string; type: 'string' }
  | { key: string; type: 'color' }
  | { key: string; type: 'file'; accept: 'image' | 'audio' }
  | { key: string; type: 'entity-ref' }
  | { key: string; type: 'select'; options: string[] }
```

---

### Stage 6 — Canvas gizmos (visual drag/select)

The hardest stage. Overlay on top of the iframe preview.

- Entity positions from CSX rendered as gizmo handles on a transparent SVG/canvas overlay
- Click handle → selects entity in hierarchy + inspector
- Drag handle → updates entity x/y in CSX → triggers codegen → iframe hot-refresh
- Collider bounds drawn as colored outlines
- Camera bounds drawn as dashed rect
- Snap to grid (optional, toggled)

**Hot-refresh strategy**
- Debounce 300ms on drag
- Re-run codegen → diff srcdoc → postMessage new srcdoc to iframe
- Iframe receives `{ type: 'cf-refresh', srcdoc }` → swaps itself without full reload

---

### Stage 7 — Asset manager

Upload and manage sprites/audio for a project.

- New: `src/components/AssetPanel.tsx` — panel in editor (tab in left sidebar)
- Upload files → `editor-assets/{user_id}/{project_id}/sprites/` or `/audio/`
- Returns public URL stored in CSX Sprite/SoundEmitter props
- Delete asset → removes from Storage + clears refs in CSX

---

### Stage 8 — Publish pipeline

- New: `src/components/PublishModal.tsx`
  - Title, description, tags (multi-select), thumbnail (canvas screenshot or upload)
  - Visibility toggle (public / unlisted)
- New: `src/lib/publish.ts`
  - `publishProject(projectId, csxDoc, meta)`
  - Runs codegen → compile → bundle
  - `Storage.upload('games/{game_id}/index.html', bundle, { upsert: true })`
  - `games` table upsert
  - Returns game URL: `https://play.cubeforge.dev/game/:id`
- Toolbar: **Publish** button (primary CTA), shows publish state (Published / Draft / Unpublished changes)
- Re-publish: same `game_id`, overwrites bundle in Storage

---

## File Structure (target)

```
apps/editor/src/
├── lib/
│   ├── auth-context.tsx       ← Stage 1
│   ├── supabase.ts            (exists)
│   ├── projects.ts            (exists)
│   ├── csx.ts                 ← Stage 2
│   ├── componentRegistry.ts   ← Stage 2
│   ├── csxUtils.ts            ← Stage 2
│   ├── codegen.ts             ← Stage 3
│   └── parser.ts              ← Stage 3
│   └── publish.ts             ← Stage 8
├── components/
│   ├── HierarchyPanel.tsx     ← Stage 5
│   ├── InspectorPanel.tsx     ← Stage 5
│   ├── AssetPanel.tsx         ← Stage 7
│   └── PublishModal.tsx       ← Stage 8
├── pages/
│   └── DashboardPage.tsx      ← Stage 4
├── App.tsx                    (exists, modified each stage)
├── compiler.ts                (exists)
├── templates.ts               (exists)
├── main.tsx                   (exists)
└── styles.css                 (exists)
```

---

## Current State (before any editor work)

- Monaco playground with file tree, template picker, iframe preview
- Raw `supabase.auth.getUser()` — no profile, no username check
- `projects` table wired for save/load/list
- No dashboard — single editor route
- No CSX — files are raw VFile[] arrays stored in project data
- No publish pipeline

**Start: Stage 1 — Auth integration**
