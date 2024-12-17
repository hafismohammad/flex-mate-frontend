import { useRef } from "react";
import Header from "../../components/user/Header";
import Banner from "../../components/user/Banner";
import Features from "../../components/user/Features";
import WorkFlow from "../../components/user/WorkFlow";
import Footer from "../../components/user/Footer";

function HomePage() {
  const servicesRef = useRef<HTMLDivElement>(null);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log('servicesRef',servicesRef)
  };

  return (
    <div className="pt-14">
      <Header scrollToServices={scrollToServices} />
      <Banner />
      <Features servicesRef={servicesRef} />
      <WorkFlow />
      <Footer />
    </div>
  );
}

export default HomePage;
