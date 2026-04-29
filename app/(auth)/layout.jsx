import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NoticeBar from "@/components/NoticeBar";

export default function AuthLayout({ children }) {
  return (
    <>
      <header className="w-full sticky top-0 z-50">
        <NoticeBar />
        <Navbar />
      </header>
      <main className="min-h-[60vh] container mx-auto px-4 md:px-10 py-12 flex justify-center">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </>
  );
}
