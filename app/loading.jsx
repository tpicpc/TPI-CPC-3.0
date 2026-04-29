import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
    </div>
  );
}
