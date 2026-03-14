import type { CsxEntity, CsxGame, CsxWorld, CsxFile } from './lib/csx'

export interface VFile {
  name: string
  content: string
}

export interface Template {
  id: string
  label: string
  icon: string
  description: string
  entities: CsxEntity[]
  game?: Partial<CsxGame>
  world?: Partial<CsxWorld>
  files?: CsxFile[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let _eid = 0
function eid(): string { return `tpl_${(++_eid).toString(36)}` }

function e(
  name: string,
  x: number,
  y: number,
  components: Array<{ type: string; props: Record<string, unknown> }>,
  children: CsxEntity[] = []
): CsxEntity {
  return { id: eid(), name, x, y, components, children }
}

function c(type: string, props: Record<string, unknown> = {}) {
  return { type, props }
}

// ── Templates ─────────────────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [

  // ── Empty ──────────────────────────────────────────────────────────────────
  {
    id: 'empty',
    label: 'Empty',
    icon: '✦',
    description: 'Blank canvas — start from scratch',
    entities: [],
    game: { width: 800, height: 500, gravity: 980 },
    world: { background: '#12131f' },
  },

  // ── Platformer ─────────────────────────────────────────────────────────────
  {
    id: 'platformer',
    label: 'Platformer',
    icon: '🏃',
    description: 'Double jump, moving platforms, camera follow',
    game: { width: 800, height: 500, gravity: 980 },
    world: { background: '#1a1a2e' },
    entities: [
      e('Camera', 400, 250, [c('Camera2D', { followEntity: 'player', smoothing: 0.85 })]),
      e('Player', 100, 300, [
        c('Sprite', { width: 32, height: 48, color: '#4fc3f7' }),
        c('RigidBody', {}),
        c('BoxCollider', { width: 32, height: 48 }),
        c('Script', { file: 'PlayerController.tsx' }),
      ]),
      e('Ground', 400, 480, [
        c('Sprite', { width: 800, height: 40, color: '#37474f' }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 800, height: 40 }),
      ]),
      e('Platform1', 200, 380, [
        c('Sprite', { width: 120, height: 20, color: '#37474f' }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 120, height: 20 }),
      ]),
      e('Platform2', 420, 310, [
        c('Sprite', { width: 150, height: 20, color: '#4caf50' }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 150, height: 20 }),
      ]),
      e('Platform3', 640, 240, [
        c('Sprite', { width: 130, height: 20, color: '#ff9800' }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 130, height: 20 }),
      ]),
    ],
    files: [
      {
        name: 'PlayerController.tsx',
        content: `import { useEntity, usePlatformerController } from 'cubeforge'

export default function PlayerController() {
  const id = useEntity()
  usePlatformerController(id, { speed: 220, jumpForce: -520, maxJumps: 2 })
  return null
}
`,
      },
    ],
  },

  // ── Particles ──────────────────────────────────────────────────────────────
  {
    id: 'particles',
    label: 'Particles',
    icon: '✨',
    description: 'ParticleEmitter presets and custom effects',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#0d1117' },
    entities: [
      e('FireEmitter', 100, 350, [
        c('ParticleEmitter', { active: true, preset: 'fire', rate: 30, particleLife: 1.2, color: '#ff6b35' }),
      ]),
      e('SmokeEmitter', 250, 350, [
        c('ParticleEmitter', { active: true, preset: 'smoke', rate: 30, particleLife: 1.5, color: '#90a4ae' }),
      ]),
      e('SparklesEmitter', 400, 350, [
        c('ParticleEmitter', { active: true, preset: 'sparkles', rate: 30, particleLife: 1.2, color: '#ffd54f' }),
      ]),
      e('FountainEmitter', 550, 400, [
        c('ParticleEmitter', {
          active: true, rate: 40, speed: 180, spread: 0.6,
          angle: -1.5708, particleLife: 1.5, particleSize: 3,
          color: '#4fc3f7', gravity: 300,
        }),
      ]),
      e('RadialEmitter', 700, 250, [
        c('ParticleEmitter', {
          active: true, rate: 5, speed: 120, spread: 6.283,
          particleLife: 0.8, particleSize: 5, color: '#e040fb', gravity: 0,
        }),
      ]),
      e('LabelFire',     100, 420, [c('Text', { text: 'fire',     fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('LabelSmoke',    250, 420, [c('Text', { text: 'smoke',    fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('LabelSparkles', 400, 420, [c('Text', { text: 'sparkles', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('LabelFountain', 550, 420, [c('Text', { text: 'fountain', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('LabelRadial',   700, 420, [c('Text', { text: 'radial',   fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
    ],
  },

  // ── Physics Sandbox ────────────────────────────────────────────────────────
  {
    id: 'physics',
    label: 'Physics Sandbox',
    icon: '⚡',
    description: 'Rigid bodies, colliders, one-way platforms, bouncing',
    game: { width: 800, height: 500, gravity: 600 },
    world: { background: '#0d1117' },
    entities: [
      e('Box1',  200,  50, [c('Sprite', { width: 30, height: 30, color: '#4fc3f7' }), c('RigidBody', { restitution: 0.5 }), c('BoxCollider', { width: 30, height: 30 })]),
      e('Box2',  250,  20, [c('Sprite', { width: 40, height: 20, color: '#ff7043' }), c('RigidBody', { restitution: 0.5 }), c('BoxCollider', { width: 40, height: 20 })]),
      e('Box3',  300,  80, [c('Sprite', { width: 25, height: 25, color: '#fdd835' }), c('RigidBody', { restitution: 0.5 }), c('BoxCollider', { width: 25, height: 25 })]),
      e('Ball1', 400,  30, [c('Sprite', { width: 30, height: 30, color: '#e040fb' }), c('RigidBody', { restitution: 0.8 }), c('CircleCollider', { radius: 15 })]),
      e('Ball2', 450,  60, [c('Sprite', { width: 24, height: 24, color: '#4fc3f7' }), c('RigidBody', { restitution: 0.8 }), c('CircleCollider', { radius: 12 })]),
      e('Ball3', 500,  10, [c('Sprite', { width: 36, height: 36, color: '#ff7043' }), c('RigidBody', { restitution: 0.8 }), c('CircleCollider', { radius: 18 })]),
      e('Crate', 550,  40, [c('Sprite', { width: 35, height: 35, color: '#66bb6a' }), c('RigidBody', { restitution: 0.4 }), c('BoxCollider', { width: 35, height: 35 })]),
      e('Ramp1', 200, 200, [c('Sprite', { width: 200, height: 12, color: '#37474f' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 200, height: 12 })]),
      e('Ramp2', 500, 300, [c('Sprite', { width: 200, height: 12, color: '#37474f' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 200, height: 12 })]),
      e('OneWay', 350, 350, [c('Sprite', { width: 150, height: 10, color: '#4caf50' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 150, height: 10, oneWay: true })]),
      e('Ground',    400, 490, [c('Sprite', { width: 800, height: 20, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 20 })]),
      e('WallLeft',    5, 250, [c('Sprite', { width: 10, height: 500, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
      e('WallRight', 795, 250, [c('Sprite', { width: 10, height: 500, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
      e('Label', 350, 370, [c('Text', { text: 'one-way (green) — jump through from below', fontSize: 10, color: '#4caf50', align: 'center', baseline: 'middle' })]),
    ],
  },

  // ── Health & Combat ────────────────────────────────────────────────────────
  {
    id: 'combat',
    label: 'Health & Combat',
    icon: '⚔️',
    description: 'useHealth, useDamageZone, trigger events',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#1a1a2e' },
    entities: [
      e('Player', 400, 250, [
        c('Sprite', { width: 28, height: 28, color: '#4fc3f7', zIndex: 5 }),
        c('RigidBody', { gravityScale: 0 }),
        c('BoxCollider', { width: 28, height: 28 }),
        c('Script', { file: 'PlayerController.tsx' }),
      ]),
      e('Enemy1', 200, 150, [
        c('Sprite', { width: 24, height: 24, color: '#ef5350', zIndex: 3 }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 24, height: 24, isTrigger: true }),
        c('Script', { file: 'EnemyController.tsx' }),
      ]),
      e('Enemy2', 600, 150, [
        c('Sprite', { width: 24, height: 24, color: '#ff7043', zIndex: 3 }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 24, height: 24, isTrigger: true }),
        c('Script', { file: 'EnemyController.tsx' }),
      ]),
      e('Enemy3', 200, 350, [
        c('Sprite', { width: 24, height: 24, color: '#e040fb', zIndex: 3 }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 24, height: 24, isTrigger: true }),
        c('Script', { file: 'EnemyController.tsx' }),
      ]),
      e('Enemy4', 600, 350, [
        c('Sprite', { width: 24, height: 24, color: '#fdd835', zIndex: 3 }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 24, height: 24, isTrigger: true }),
        c('Script', { file: 'EnemyController.tsx' }),
      ]),
      e('WallTop',    400,   5, [c('Sprite', { width: 800, height: 10, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 10 })]),
      e('WallBottom', 400, 495, [c('Sprite', { width: 800, height: 10, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 10 })]),
      e('WallLeft',     5, 250, [c('Sprite', { width: 10, height: 500, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
      e('WallRight',  795, 250, [c('Sprite', { width: 10, height: 500, color: '#263238' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
    ],
    files: [
      {
        name: 'PlayerController.tsx',
        content: `import { useEntity, useTopDownMovement, useHealth } from 'cubeforge'

export default function PlayerController() {
  const id = useEntity()
  useTopDownMovement(id, { speed: 180 })
  useHealth(id, {
    maxHealth: 5,
    invincibilityDuration: 1,
    onDeath: () => console.log('Player died'),
  })
  return null
}
`,
      },
      {
        name: 'EnemyController.tsx',
        content: `import { useEntity, useDamageZone } from 'cubeforge'

export default function EnemyController() {
  const id = useEntity()
  useDamageZone(id, { damage: 1, targetTag: 'player' })
  return null
}
`,
      },
    ],
  },

  // ── Camera Effects ─────────────────────────────────────────────────────────
  {
    id: 'camera',
    label: 'Camera Effects',
    icon: '📷',
    description: 'Shake, zoom, follow offset, screen flash',
    game: { width: 800, height: 500, gravity: 980 },
    world: { background: '#0d1117' },
    entities: [
      e('Camera', 400, 250, [c('Camera2D', { followEntity: 'player', smoothing: 0.9 })]),
      e('Player', 400, 300, [
        c('Sprite', { width: 32, height: 48, color: '#4fc3f7' }),
        c('RigidBody', {}),
        c('BoxCollider', { width: 32, height: 48 }),
        c('Script', { file: 'PlayerController.tsx' }),
      ]),
      e('Ground', 400, 480, [
        c('Sprite', { width: 800, height: 40, color: '#37474f' }),
        c('RigidBody', { isStatic: true }),
        c('BoxCollider', { width: 800, height: 40 }),
      ]),
      e('CameraControls', 0, 0, [
        c('Script', { file: 'CameraControls.tsx' }),
      ]),
      e('HintShake',  150, 100, [c('Sprite', { width: 100, height: 36, color: '#ef5350', zIndex: 10 })]),
      e('LabelShake', 150, 100, [c('Text', { text: 'Q=SHAKE', fontSize: 12, color: '#fff', align: 'center', baseline: 'middle', zIndex: 11 })]),
      e('HintZoom',   300, 100, [c('Sprite', { width: 100, height: 36, color: '#4caf50', zIndex: 10 })]),
      e('LabelZoom',  300, 100, [c('Text', { text: 'E=ZOOM',  fontSize: 12, color: '#fff', align: 'center', baseline: 'middle', zIndex: 11 })]),
      e('HintFlash',  450, 100, [c('Sprite', { width: 100, height: 36, color: '#fdd835', zIndex: 10 })]),
      e('LabelFlash', 450, 100, [c('Text', { text: 'F=FLASH', fontSize: 12, color: '#0a0a0f', align: 'center', baseline: 'middle', zIndex: 11 })]),
      e('Hint', 400, 460, [c('Text', { text: 'Q=shake  E=zoom  F=flash  |  WASD+Space=move', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
    ],
    files: [
      {
        name: 'PlayerController.tsx',
        content: `import { useEntity, usePlatformerController } from 'cubeforge'

export default function PlayerController() {
  const id = useEntity()
  usePlatformerController(id, { speed: 220, jumpForce: -500, maxJumps: 2 })
  return null
}
`,
      },
      {
        name: 'CameraControls.tsx',
        content: `import { Script } from 'cubeforge'
import { useCamera } from 'cubeforge'
import type { EntityId, ECSWorld, InputManager } from 'cubeforge'

let zoomed = false

export default function CameraControls() {
  const camera = useCamera()
  return (
    <Script update={(_id: EntityId, _world: ECSWorld, input: InputManager) => {
      if (input.isPressed('KeyQ')) camera.shake(8, 0.3)
      if (input.isPressed('KeyE')) {
        zoomed = !zoomed
        camera.setZoom(zoomed ? 1.5 : 1)
      }
    }} />
  )
}
`,
      },
    ],
  },

  // ── Script Component ───────────────────────────────────────────────────────
  {
    id: 'script',
    label: 'Script Component',
    icon: '📜',
    description: 'Custom game logic with init/update functions',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#0a0a12' },
    entities: [
      e('Player', 400, 420, [
        c('Sprite', { width: 24, height: 24, color: '#4fc3f7', zIndex: 5 }),
        c('Script', { file: 'PlayerScript.tsx' }),
      ]),
      e('Instructions', 400, 480, [
        c('Text', { text: 'WASD — move  |  Space — shoot', fontSize: 11, color: '#37474f', align: 'center', baseline: 'middle' }),
      ]),
      e('Title', 400, 20, [
        c('Text', { text: 'Script component — raw ECS game logic', fontSize: 12, color: '#546e7a', align: 'center', baseline: 'middle' }),
      ]),
    ],
    files: [
      {
        name: 'PlayerScript.tsx',
        content: `import { Script } from 'cubeforge'
import type { EntityId, ECSWorld, InputManager } from 'cubeforge'

const speed = 200

export default function PlayerScript() {
  return (
    <Script update={(id: EntityId, world: ECSWorld, input: InputManager, dt: number) => {
      const t = world.getComponent(id, 'Transform') as any
      if (!t) return

      let dx = 0, dy = 0
      if (input.isDown('KeyW') || input.isDown('ArrowUp'))    dy = -1
      if (input.isDown('KeyS') || input.isDown('ArrowDown'))  dy =  1
      if (input.isDown('KeyA') || input.isDown('ArrowLeft'))  dx = -1
      if (input.isDown('KeyD') || input.isDown('ArrowRight')) dx =  1

      t.x += dx * speed * dt
      t.y += dy * speed * dt
      t.x = Math.max(20, Math.min(780, t.x))
      t.y = Math.max(20, Math.min(480, t.y))
    }} />
  )
}
`,
      },
    ],
  },

  // ── Triggers & Events ──────────────────────────────────────────────────────
  {
    id: 'triggers',
    label: 'Triggers & Events',
    icon: '🔔',
    description: 'Trigger zones, collision events, event bus',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#0d1117' },
    entities: [
      e('Player', 400, 250, [
        c('Sprite', { width: 24, height: 24, color: '#ffffff', zIndex: 5 }),
        c('RigidBody', { gravityScale: 0 }),
        c('BoxCollider', { width: 24, height: 24 }),
        c('Script', { file: 'PlayerController.tsx' }),
      ]),
      e('BlueZone',  150, 150, [
        c('Sprite', { width: 80, height: 80, color: '#4fc3f7', opacity: 0.2, zIndex: 1 }),
        c('BoxCollider', { width: 80, height: 80, isTrigger: true }),
        c('Script', { file: 'TriggerZone.tsx' }),
      ]),
      e('RedZone',   650, 150, [
        c('Sprite', { width: 80, height: 80, color: '#ef5350', opacity: 0.2, zIndex: 1 }),
        c('BoxCollider', { width: 80, height: 80, isTrigger: true }),
        c('Script', { file: 'TriggerZone.tsx' }),
      ]),
      e('GreenZone', 150, 350, [
        c('Sprite', { width: 80, height: 80, color: '#66bb6a', opacity: 0.2, zIndex: 1 }),
        c('BoxCollider', { width: 80, height: 80, isTrigger: true }),
        c('Script', { file: 'TriggerZone.tsx' }),
      ]),
      e('GoldZone',  650, 350, [
        c('Sprite', { width: 80, height: 80, color: '#fdd835', opacity: 0.2, zIndex: 1 }),
        c('BoxCollider', { width: 80, height: 80, isTrigger: true }),
        c('Script', { file: 'TriggerZone.tsx' }),
      ]),
      e('WallTop',    400,   5, [c('Sprite', { width: 800, height: 10, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 10 })]),
      e('WallBottom', 400, 495, [c('Sprite', { width: 800, height: 10, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 10 })]),
      e('WallLeft',     5, 250, [c('Sprite', { width: 10, height: 500, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
      e('WallRight',  795, 250, [c('Sprite', { width: 10, height: 500, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
      e('Hint', 400, 475, [c('Text', { text: 'Walk into the colored zones', fontSize: 11, color: '#37474f', align: 'center', baseline: 'middle' })]),
    ],
    files: [
      {
        name: 'PlayerController.tsx',
        content: `import { useEntity, useTopDownMovement } from 'cubeforge'

export default function PlayerController() {
  const id = useEntity()
  useTopDownMovement(id, { speed: 200 })
  return null
}
`,
      },
      {
        name: 'TriggerZone.tsx',
        content: `import { useEntity, useTriggerEnter, useTriggerExit } from 'cubeforge'

export default function TriggerZone() {
  const id = useEntity()
  useTriggerEnter(id, (other) => {
    console.log('Entered zone', id, 'by', other)
  })
  useTriggerExit(id, (other) => {
    console.log('Exited zone', id, 'by', other)
  })
  return null
}
`,
      },
    ],
  },

  // ── Shapes & Drawing ───────────────────────────────────────────────────────
  {
    id: 'shapes',
    label: 'Shapes & Drawing',
    icon: '🎨',
    description: 'Circle, Line, Polygon, Gradient primitives',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#0a0a12' },
    entities: [
      e('Circle', 120, 180, [c('Circle', { radius: 50, color: '#4fc3f7' })]),
      e('CircleLabel', 120, 255, [c('Text', { text: 'Circle', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Line', 280, 130, [c('Line', { endX: 80, endY: 100, color: '#ef5350', lineWidth: 3 })]),
      e('LineLabel', 310, 260, [c('Text', { text: 'Line', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Triangle', 460, 180, [
        c('Polygon', {
          points: [{ x: 0, y: -50 }, { x: 50, y: 40 }, { x: -50, y: 40 }],
          color: '#66bb6a',
          closed: true,
        }),
      ]),
      e('TriangleLabel', 460, 260, [c('Text', { text: 'Polygon', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Hexagon', 630, 180, [
        c('Polygon', {
          points: Array.from({ length: 6 }, (_, i) => ({
            x: Math.round(Math.cos(Math.PI / 3 * i - Math.PI / 6) * 50),
            y: Math.round(Math.sin(Math.PI / 3 * i - Math.PI / 6) * 50),
          })),
          color: '#fdd835',
          closed: true,
        }),
      ]),
      e('HexagonLabel', 630, 260, [c('Text', { text: 'Hexagon', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('GradientRect', 400, 380, [
        c('Gradient', {
          gradientType: 'linear',
          stops: [
            { offset: 0, color: '#4fc3f7' },
            { offset: 0.5, color: '#e040fb' },
            { offset: 1, color: '#ff7043' },
          ],
          width: 600,
          height: 60,
        }),
      ]),
      e('GradientLabel', 400, 430, [c('Text', { text: 'Linear Gradient', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Title', 400, 40, [c('Text', { text: 'Shape Primitives', fontSize: 16, color: '#78909c', align: 'center', baseline: 'middle' })]),
    ],
  },

  // ── Top-Down ───────────────────────────────────────────────────────────────
  {
    id: 'top-down',
    label: 'Top-Down',
    icon: '🎮',
    description: '4-directional movement, wall collisions',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#1a1a2e' },
    entities: [
      e('Player', 400, 250, [
        c('Sprite', { width: 32, height: 32, color: '#4fc3f7' }),
        c('RigidBody', { gravityScale: 0 }),
        c('BoxCollider', { width: 30, height: 30 }),
        c('Script', { file: 'PlayerController.tsx' }),
      ]),
      e('WallTop',    400,  10, [c('Sprite', { width: 800, height: 20, color: '#455a64' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 20 })]),
      e('WallBottom', 400, 490, [c('Sprite', { width: 800, height: 20, color: '#455a64' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 20 })]),
      e('WallLeft',    10, 250, [c('Sprite', { width: 20, height: 500, color: '#455a64' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 20, height: 500 })]),
      e('WallRight',  790, 250, [c('Sprite', { width: 20, height: 500, color: '#455a64' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 20, height: 500 })]),
      e('Pillar1', 300, 200, [c('Sprite', { width: 20, height: 160, color: '#37474f' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 20, height: 160 })]),
      e('Pillar2', 500, 300, [c('Sprite', { width: 20, height: 160, color: '#37474f' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 20, height: 160 })]),
    ],
    files: [
      {
        name: 'PlayerController.tsx',
        content: `import { useEntity, useTopDownMovement } from 'cubeforge'

export default function PlayerController() {
  const id = useEntity()
  useTopDownMovement(id, { speed: 180 })
  return null
}
`,
      },
    ],
  },

  // ── Input Mapping ──────────────────────────────────────────────────────────
  {
    id: 'input-map',
    label: 'Input Mapping',
    icon: '🕹️',
    description: 'Named actions, multi-key bindings',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#0d1117' },
    entities: [
      e('Player', 400, 250, [
        c('Sprite', { width: 28, height: 28, color: '#4fc3f7', zIndex: 5 }),
        c('RigidBody', { gravityScale: 0 }),
        c('BoxCollider', { width: 28, height: 28 }),
        c('Script', { file: 'PlayerController.tsx' }),
      ]),
      e('Title', 400, 40, [c('Text', { text: 'Input Map — Named Actions', fontSize: 14, color: '#78909c', align: 'center', baseline: 'middle' })]),
      e('Hint', 400, 70, [c('Text', { text: 'WASD/Arrows=move | Shift=dash | Space/E=action', fontSize: 10, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('WallTop',    400,   5, [c('Sprite', { width: 800, height: 10, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 10 })]),
      e('WallBottom', 400, 495, [c('Sprite', { width: 800, height: 10, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 800, height: 10 })]),
      e('WallLeft',     5, 250, [c('Sprite', { width: 10, height: 500, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
      e('WallRight',  795, 250, [c('Sprite', { width: 10, height: 500, color: '#1e2535' }), c('RigidBody', { isStatic: true }), c('BoxCollider', { width: 10, height: 500 })]),
    ],
    files: [
      {
        name: 'PlayerController.tsx',
        content: `import { useEntity, useInputMap, createInputMap, Script } from 'cubeforge'
import type { EntityId, ECSWorld } from 'cubeforge'

const actions = createInputMap({
  moveUp:    ['KeyW', 'ArrowUp'],
  moveDown:  ['KeyS', 'ArrowDown'],
  moveLeft:  ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  dash:      ['ShiftLeft', 'ShiftRight'],
})

export default function PlayerController() {
  const id = useEntity()
  const input = useInputMap(actions)
  return (
    <Script update={(eid: EntityId, world: ECSWorld) => {
      const t = world.getComponent(eid, 'Transform') as any
      if (!t || !input) return
      let dx = 0, dy = 0
      if (input.isActionDown('moveUp'))    dy = -1
      if (input.isActionDown('moveDown'))  dy =  1
      if (input.isActionDown('moveLeft'))  dx = -1
      if (input.isActionDown('moveRight')) dx =  1
      const speed = input.isActionDown('dash') ? 400 : 200
      t.x = Math.max(20, Math.min(780, t.x + dx * speed * 0.016))
      t.y = Math.max(20, Math.min(480, t.y + dy * speed * 0.016))
    }} />
  )
}
`,
      },
    ],
  },

  // ── Timers & Tweens ────────────────────────────────────────────────────────
  {
    id: 'timers',
    label: 'Timers & Tweens',
    icon: '⏱️',
    description: 'Script-driven animation, sine wave tweens',
    game: { width: 800, height: 500, gravity: 0 },
    world: { background: '#0a0a12' },
    entities: [
      e('Bounce', 150, 250, [
        c('Sprite', { width: 40, height: 40, color: '#4fc3f7' }),
        c('Script', { file: 'BounceAnimation.tsx' }),
      ]),
      e('BounceLabel', 150, 400, [c('Text', { text: 'Bounce', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Orbit', 400, 250, [
        c('Sprite', { width: 30, height: 30, color: '#e040fb' }),
        c('Script', { file: 'OrbitAnimation.tsx' }),
      ]),
      e('OrbitLabel', 400, 400, [c('Text', { text: 'Orbit', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Pulse', 550, 250, [
        c('Sprite', { width: 40, height: 40, color: '#66bb6a' }),
        c('Script', { file: 'PulseAnimation.tsx' }),
      ]),
      e('PulseLabel', 550, 400, [c('Text', { text: 'Pulse', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Fade', 700, 250, [
        c('Sprite', { width: 40, height: 40, color: '#fdd835' }),
        c('Script', { file: 'FadeAnimation.tsx' }),
      ]),
      e('FadeLabel', 700, 400, [c('Text', { text: 'Fade', fontSize: 11, color: '#546e7a', align: 'center', baseline: 'middle' })]),
      e('Title', 400, 40, [c('Text', { text: 'Script-driven animations', fontSize: 14, color: '#78909c', align: 'center', baseline: 'middle' })]),
    ],
    files: [
      {
        name: 'BounceAnimation.tsx',
        content: `import { Script } from 'cubeforge'
import type { EntityId, ECSWorld } from 'cubeforge'

export default function BounceAnimation() {
  return (
    <Script update={(id: EntityId, world: ECSWorld) => {
      const t = world.getComponent(id, 'Transform') as any
      if (t) t.y = 250 + Math.sin(performance.now() / 1000 * 2) * 80
    }} />
  )
}
`,
      },
      {
        name: 'OrbitAnimation.tsx',
        content: `import { Script } from 'cubeforge'
import type { EntityId, ECSWorld } from 'cubeforge'

export default function OrbitAnimation() {
  return (
    <Script update={(id: EntityId, world: ECSWorld) => {
      const t = world.getComponent(id, 'Transform') as any
      if (!t) return
      const time = performance.now() / 1000
      t.x = 400 + Math.cos(time * 1.5) * 150
      t.y = 250 + Math.sin(time * 1.5) * 100
    }} />
  )
}
`,
      },
      {
        name: 'PulseAnimation.tsx',
        content: `import { Script } from 'cubeforge'
import type { EntityId, ECSWorld } from 'cubeforge'

export default function PulseAnimation() {
  return (
    <Script update={(id: EntityId, world: ECSWorld) => {
      const s = world.getComponent(id, 'Sprite') as any
      if (!s) return
      const scale = 1 + Math.sin(performance.now() / 1000 * 3) * 0.3
      s.width = 40 * scale
      s.height = 40 * scale
    }} />
  )
}
`,
      },
      {
        name: 'FadeAnimation.tsx',
        content: `import { Script } from 'cubeforge'
import type { EntityId, ECSWorld } from 'cubeforge'

export default function FadeAnimation() {
  return (
    <Script update={(id: EntityId, world: ECSWorld) => {
      const s = world.getComponent(id, 'Sprite') as any
      if (!s) return
      const alpha = (Math.sin(performance.now() / 1000 * 2) + 1) / 2
      s.opacity = 0.2 + alpha * 0.8
    }} />
  )
}
`,
      },
    ],
  },
]
