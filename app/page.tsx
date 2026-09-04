import About from "@/components/About";
import FeaturedWork from "@/components/FeaturedWork";
import Hero from "@/components/Hero";
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
      </main>
    </>
  );
}
