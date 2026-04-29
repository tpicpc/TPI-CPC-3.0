export default function SectionTitle({ title, subtitle, center = true }) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
