import { FEATURES } from "@/lib/features";
import { notFound } from "next/navigation";

// Hidden behind a feature flag; set FEATURES.projects = true in lib/features.js to re-enable.
export default function ProjectsGateLayout({ children }) {
  if (!FEATURES.projects) notFound();
  return children;
}
