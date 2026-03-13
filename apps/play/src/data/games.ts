export interface Game {
  slug: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  color: string;
  plays: number;
  rating: number;
  featured?: boolean;
}

export const games: Game[] = [
  {
    slug: "platformer",
    title: "Platformer",
    author: "CubeForge Team",
    description:
      "Classic platformer with enemies, coins, and coyote-time jumps. Full physics and multiple levels.",
    tags: ["platformer", "physics", "adventure"],
    color: "#4fc3f7",
    plays: 2847,
    rating: 4.7,
    featured: true,
  },
  {
    slug: "mario-clone",
    title: "Mario Clone",
    author: "CubeForge Team",
    description:
      "Multi-level recreation with power-ups, enemy AI, and warp pipes.",
    tags: ["platformer", "retro", "power-ups"],
    color: "#f38ba8",
    plays: 5213,
    rating: 4.9,
    featured: true,
  },
  {
    slug: "top-down-rpg",
    title: "Top-Down RPG",
    author: "CubeForge Team",
    description:
      "WASD movement with collision, enemies, and key pickups. Explore a small dungeon.",
    tags: ["rpg", "top-down", "exploration"],
    color: "#a6e3a1",
    plays: 1932,
    rating: 4.5,
    featured: true,
  },
  {
    slug: "endless-runner",
    title: "Endless Runner",
    author: "CubeForge Team",
    description:
      "Auto-scrolling obstacle course with score tracking and increasing difficulty.",
    tags: ["runner", "arcade", "highscore"],
    color: "#f9e2af",
    plays: 3651,
    rating: 4.3,
  },
  {
    slug: "breakout",
    title: "Breakout",
    author: "CubeForge Team",
    description:
      "Classic brick-breaker with paddle, ball, power-ups, and particle effects.",
    tags: ["arcade", "classic", "physics"],
    color: "#cba6f7",
    plays: 2104,
    rating: 4.6,
  },
  {
    slug: "flappy-bird",
    title: "Flappy Bird",
    author: "CubeForge Team",
    description: "Tap-to-fly through pipes with score tracking and restart.",
    tags: ["arcade", "casual", "highscore"],
    color: "#fab387",
    plays: 8921,
    rating: 4.2,
  },
  {
    slug: "shooter",
    title: "Space Shooter",
    author: "CubeForge Team",
    description:
      "Top-down space shooter with waves of enemies, bullets, and explosions.",
    tags: ["shooter", "space", "action"],
    color: "#89b4fa",
    plays: 1587,
    rating: 4.4,
  },
  {
    slug: "pong",
    title: "Pong",
    author: "CubeForge Team",
    description:
      "Two-player pong with AI opponent, score tracking, and increasing speed.",
    tags: ["classic", "multiplayer", "arcade"],
    color: "#94e2d5",
    plays: 4320,
    rating: 4.1,
  },
  {
    slug: "snake",
    title: "Snake",
    author: "CubeForge Team",
    description:
      "Classic snake game with growing tail, food spawning, and wall collision.",
    tags: ["classic", "casual", "retro"],
    color: "#a6e3a1",
    plays: 6102,
    rating: 4.0,
  },
];

export const tags = [
  "All",
  "platformer",
  "arcade",
  "rpg",
  "shooter",
  "classic",
  "casual",
  "multiplayer",
  "physics",
  "retro",
];
