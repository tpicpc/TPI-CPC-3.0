import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl md:text-9xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-4 text-xl">The page you are looking for doesn't exist.</p>
      <Link href="/" className="mt-6"><Button>Go Home</Button></Link>
    </div>
  );
}
