import Hero from "@/components/Hero";
import SelectedWork from "@/components/SelectedWork";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Legacy from "@/components/Legacy";
import Contact from "@/components/Contact";
export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <About />
      <Experience />
      <Skills />
      <Certifications />
      <Legacy compact />
      <Contact />
    </>
  );
}
