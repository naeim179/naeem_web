import About from "@/components/About";
import Contact from "@/components/Contact";
import FeaturedWork from "@/components/FeaturedWork";
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
        <Skills />
        <Reports />
        <Labs />
        <Legacy />
        <Contact />
      </main>
    </>
  );
}
