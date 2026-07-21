import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Feature";
import Stats from "../components/home/Stats";
import CTA from "../components/home/CTA";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <CTA />
    </>
  );
}

export default Home;