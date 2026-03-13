import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { CodeDemo } from "./components/CodeDemo";
import { Features } from "./components/Features";
import { Examples } from "./components/Examples";
import { GetStarted } from "./components/GetStarted";
import { Footer } from "./components/Footer";
import { PhysicsBgLoader } from "./components/PhysicsBgLoader";

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
  const release = await getLatestRelease();

  return (
    <main className="bg-grid min-h-screen overflow-x-hidden relative">
      <PhysicsBgLoader />
      <div className="relative z-10">
        <Navbar />
        <Hero version={release.version} title={release.title} />
        <CodeDemo />
      <Features />
      <Examples />
      <GetStarted />
        <Footer />
      </div>
    </main>
  );
}
