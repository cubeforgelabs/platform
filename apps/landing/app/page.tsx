import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { CodeDemo } from "./components/CodeDemo";
import { Features } from "./components/Features";
import { Examples, type GameEntry } from "./components/Examples";
import { GetStarted } from "./components/GetStarted";
import { Footer } from "./components/Footer";
import { PhysicsBgLoader } from "./components/PhysicsBgLoader";

async function getFeaturedGames(): Promise<GameEntry[]> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const res = await fetch(
      `${url}/rest/v1/games?select=id,title,description,tags,thumbnail_url,slug&is_official=eq.true&order=plays.desc&limit=6`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getLatestRelease(): Promise<{
  version: string;
  title: string;
}> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/1homsi/cubeforge/releases/latest",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return { version: "v0.4.2", title: "" };
    const data = await res.json();
    const version = data.tag_name ?? "v0.4.2";
    const title = (data.name ?? "").replace(version, "").replace(/^[\s—–-]+/, "").trim();
    return { version, title };
  } catch {
    return { version: "v0.4.2", title: "" };
  }
}

export default async function Home() {
  const [release, games] = await Promise.all([getLatestRelease(), getFeaturedGames()])

  return (
    <main className="bg-grid min-h-screen overflow-x-hidden relative">
      <PhysicsBgLoader />
      <div className="relative z-10">
        <Navbar />
        <Hero version={release.version} title={release.title} />
        <CodeDemo />
      <Features />
      <Examples games={games} />
      <GetStarted />
        <Footer />
      </div>
    </main>
  );
}
