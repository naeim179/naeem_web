import About from "@/components/About";
import FeaturedWork from "@/components/FeaturedWork";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
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
      </main>
    </>
  );
}
