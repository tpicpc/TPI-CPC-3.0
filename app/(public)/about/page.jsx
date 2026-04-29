import SectionTitle from "@/components/SectionTitle";

export const metadata = { title: "About — TPI CPC" };

export default function AboutPage() {
  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle title="About TPI CPC" subtitle="Learn what drives our community" />
      <div className="prose dark:prose-invert max-w-3xl mx-auto">
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          TPI CPC — Thakurgaon Polytechnic Institute Computer & Programming Club — is a student-led community where technology lovers come together to learn, build, and grow. We host workshops, contests, hackathons, and seminars to help our members become world-class problem solvers and engineers.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Our mission is to make programming accessible, fun, and impactful for every student of TPI. From beginners writing their first <code>console.log</code>, to advanced contestants solving algorithmic challenges, everyone has a place here. 🚀
        </p>
      </div>
    </div>
  );
}
