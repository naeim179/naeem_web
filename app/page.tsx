import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import FeaturedWork from "@/components/FeaturedWork";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Labs from "@/components/Labs";
import Legacy from "@/components/Legacy";
import Navbar from "@/components/Navbar";
import Reports from "@/components/Reports";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <FeaturedWork />
        <About />
        <Experience />
        <Skills />
        <Certifications />
        <Reports />
        <Labs />
        <Legacy />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
