import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NoticeBar from "@/components/NoticeBar";

export default function PublicLayout({ children }) {
  return (
    <div className="w-full sticky-header-wrap">
      <header className="w-full sticky top-0 z-50">
        <NoticeBar />
        <Navbar />
      </header>
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </div>
  );
}
