"use client";

import dynamic from "next/dynamic";

const PhysicsBg = dynamic(
  () => import("./PhysicsBg").then((m) => ({ default: m.PhysicsBg })),
  { ssr: false },
);

export function PhysicsBgLoader() {
  return <PhysicsBg />;
}
