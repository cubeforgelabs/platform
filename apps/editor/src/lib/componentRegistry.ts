export type FieldType =
  | 'number'
  | 'boolean'
  | 'string'
  | 'color'
  | 'file-image'
  | 'file-audio'
  | 'entity-ref'
  | 'select'

export interface FieldSchema {
  key: string
  label?: string
  type: FieldType
  min?: number
  max?: number
  step?: number
  options?: string[]
}

export type ComponentCategory = 'physics' | 'rendering' | 'camera' | 'logic' | 'audio' | 'effects'

export interface ComponentDef {
  type: string
  label: string
  category: ComponentCategory
  icon: string
  defaultProps: Record<string, unknown>
  schema: FieldSchema[]
  codegen: (props: Record<string, unknown>) => string
}

export const COMPONENT_CATEGORIES: Record<ComponentCategory, { label: string; color: string }> = {
  physics:   { label: 'Physics',   color: '#f38ba8' },
  rendering: { label: 'Rendering', color: '#a6e3a1' },
  camera:    { label: 'Camera',    color: '#89dceb' },
  logic:     { label: 'Logic',     color: '#cba6f7' },
  audio:     { label: 'Audio',     color: '#f9e2af' },
  effects:   { label: 'Effects',   color: '#fab387' },
}

function sp(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'boolean') return v ? k : `${k}={false}`
      if (typeof v === 'number') return `${k}={${v}}`
      if (typeof v === 'string') return `${k}="${v}"`
      return `${k}={${JSON.stringify(v)}}`
    })
    .join(' ')
}

export const COMPONENT_REGISTRY: Record<string, ComponentDef> = {
  RigidBody: {
    type: 'RigidBody', label: 'Rigid Body', category: 'physics', icon: '⚡',
    defaultProps: { mass: 1, lockRotation: true, gravityScale: 1 },
    schema: [
      { key: 'mass',          type: 'number',  min: 0, step: 0.1 },
      { key: 'lockRotation',  type: 'boolean' },
      { key: 'gravityScale',  type: 'number',  step: 0.1 },
      { key: 'isKinematic',   type: 'boolean' },
      { key: 'sleepThreshold',type: 'number',  min: 0, step: 0.1 },
    ],
    codegen: (p) => `<RigidBody ${sp(p)} />`,
  },

  BoxCollider: {
    type: 'BoxCollider', label: 'Box Collider', category: 'physics', icon: '▭',
    defaultProps: { width: 32, height: 32, isTrigger: false },
    schema: [
      { key: 'width',   type: 'number', min: 1 },
      { key: 'height',  type: 'number', min: 1 },
      { key: 'offsetX', type: 'number' },
      { key: 'offsetY', type: 'number' },
      { key: 'isTrigger', type: 'boolean' },
      { key: 'layer',   type: 'number', min: 0 },
      { key: 'mask',    type: 'number', min: 0 },
    ],
    codegen: (p) => `<BoxCollider ${sp(p)} />`,
  },

  CircleCollider: {
    type: 'CircleCollider', label: 'Circle Collider', category: 'physics', icon: '○',
    defaultProps: { radius: 16, isTrigger: false },
    schema: [
      { key: 'radius',  type: 'number', min: 1 },
      { key: 'offsetX', type: 'number' },
      { key: 'offsetY', type: 'number' },
      { key: 'isTrigger', type: 'boolean' },
      { key: 'layer',   type: 'number', min: 0 },
      { key: 'mask',    type: 'number', min: 0 },
    ],
    codegen: (p) => `<CircleCollider ${sp(p)} />`,
  },

  CapsuleCollider: {
    type: 'CapsuleCollider', label: 'Capsule Collider', category: 'physics', icon: '⬭',
    defaultProps: { width: 24, height: 48, isTrigger: false },
    schema: [
      { key: 'width',     type: 'number', min: 1 },
      { key: 'height',    type: 'number', min: 1 },
      { key: 'isTrigger', type: 'boolean' },
      { key: 'layer',     type: 'number', min: 0 },
      { key: 'mask',      type: 'number', min: 0 },
    ],
    codegen: (p) => `<CapsuleCollider ${sp(p)} />`,
  },

  Sprite: {
    type: 'Sprite', label: 'Sprite', category: 'rendering', icon: '🖼',
    defaultProps: { src: '', width: 32, height: 32, opacity: 1, flipX: false, flipY: false },
    schema: [
      { key: 'src',     type: 'file-image', label: 'Image' },
      { key: 'width',   type: 'number', min: 1 },
      { key: 'height',  type: 'number', min: 1 },
      { key: 'opacity', type: 'number', min: 0, max: 1, step: 0.05 },
      { key: 'flipX',   type: 'boolean' },
      { key: 'flipY',   type: 'boolean' },
    ],
    codegen: (p) => `<Sprite ${sp(p)} />`,
  },

  Animation: {
    type: 'Animation', label: 'Animation', category: 'rendering', icon: '▶',
    defaultProps: { src: '', frameWidth: 32, frameHeight: 32, fps: 12, loop: true, autoPlay: true },
    schema: [
      { key: 'src',         type: 'file-image', label: 'Spritesheet' },
      { key: 'frameWidth',  type: 'number', min: 1 },
      { key: 'frameHeight', type: 'number', min: 1 },
      { key: 'fps',         type: 'number', min: 1, max: 60 },
      { key: 'loop',        type: 'boolean' },
      { key: 'autoPlay',    type: 'boolean' },
    ],
    codegen: (p) => `<Animation ${sp(p)} />`,
  },

  Camera2D: {
    type: 'Camera2D', label: 'Camera 2D', category: 'camera', icon: '📷',
    defaultProps: { smoothing: 0.87, zoom: 1 },
    schema: [
      { key: 'followEntity', type: 'entity-ref', label: 'Follow Entity' },
      { key: 'smoothing',    type: 'number', min: 0, max: 1, step: 0.01 },
      { key: 'zoom',         type: 'number', min: 0.1, max: 10, step: 0.1 },
      { key: 'offsetX',      type: 'number' },
      { key: 'offsetY',      type: 'number' },
    ],
    codegen: (p) => `<Camera2D ${sp(p)} />`,
  },

  Script: {
    type: 'Script', label: 'Script', category: 'logic', icon: '📜',
    defaultProps: { file: '' },
    schema: [
      { key: 'file', type: 'string', label: 'Script file (.tsx)' },
    ],
    codegen: () => '',
  },

  Text: {
    type: 'Text', label: 'Text', category: 'rendering', icon: 'T',
    defaultProps: { content: 'Hello', fontSize: 16, color: '#ffffff', align: 'left' },
    schema: [
      { key: 'content',    type: 'string' },
      { key: 'fontSize',   type: 'number', min: 6, max: 200 },
      { key: 'color',      type: 'color' },
      { key: 'align',      type: 'select', options: ['left', 'center', 'right'] },
    ],
    codegen: (p) => `<Text ${sp(p)} />`,
  },

  Shape: {
    type: 'Shape', label: 'Shape', category: 'rendering', icon: '◼',
    defaultProps: { type: 'rect', color: '#4fc3f7', width: 32, height: 32 },
    schema: [
      { key: 'type',   type: 'select', options: ['rect', 'circle', 'line'] },
      { key: 'color',  type: 'color' },
      { key: 'width',  type: 'number', min: 1 },
      { key: 'height', type: 'number', min: 1 },
      { key: 'radius', type: 'number', min: 1 },
    ],
    codegen: (p) => `<Shape ${sp(p)} />`,
  },

  ParticleEmitter: {
    type: 'ParticleEmitter', label: 'Particles', category: 'effects', icon: '✨',
    defaultProps: { rate: 20, speed: 100, lifetime: 1, color: '#4fc3f7' },
    schema: [
      { key: 'rate',     type: 'number', min: 1, max: 1000 },
      { key: 'speed',    type: 'number', min: 0 },
      { key: 'lifetime', type: 'number', min: 0.1, step: 0.1 },
      { key: 'color',    type: 'color' },
    ],
    codegen: (p) => `<ParticleEmitter ${sp(p)} />`,
  },

  Trail: {
    type: 'Trail', label: 'Trail', category: 'effects', icon: '〰',
    defaultProps: { length: 20, color: '#4fc3f7', width: 2 },
    schema: [
      { key: 'length', type: 'number', min: 1, max: 200 },
      { key: 'color',  type: 'color' },
      { key: 'width',  type: 'number', min: 1 },
    ],
    codegen: (p) => `<Trail ${sp(p)} />`,
  },

  SoundEmitter: {
    type: 'SoundEmitter', label: 'Sound', category: 'audio', icon: '🔊',
    defaultProps: { src: '', volume: 1, loop: false, autoPlay: false },
    schema: [
      { key: 'src',      type: 'file-audio', label: 'Audio file' },
      { key: 'volume',   type: 'number', min: 0, max: 1, step: 0.05 },
      { key: 'loop',     type: 'boolean' },
      { key: 'autoPlay', type: 'boolean' },
    ],
    codegen: (p) => `<SoundEmitter ${sp(p)} />`,
  },

  Tilemap: {
    type: 'Tilemap', label: 'Tilemap', category: 'rendering', icon: '🗺',
    defaultProps: { src: '', tileWidth: 16, tileHeight: 16 },
    schema: [
      { key: 'src',            type: 'string',     label: 'Tilemap JSON path' },
      { key: 'tileWidth',      type: 'number',     min: 1 },
      { key: 'tileHeight',     type: 'number',     min: 1 },
      { key: 'collisionLayer', type: 'string',     label: 'Collision layer name' },
    ],
    codegen: (p) => `<Tilemap ${sp(p)} />`,
  },
}

export const COMPONENT_LIST = Object.values(COMPONENT_REGISTRY)
