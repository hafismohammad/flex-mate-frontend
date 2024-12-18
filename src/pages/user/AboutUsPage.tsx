import { useRef } from "react";
import AboutUs from "../../components/user/AboutUs"
import Footer from "../../components/user/Footer"
import Header from "../../components/user/Header"


function AboutUsPage() {
  const scrollToServices = () => {
      const servicesRef = useRef<HTMLDivElement>(null);
    
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log('servicesRef',servicesRef)
  };
  return (
    <div>
        <Header scrollToServices={scrollToServices}/>
        <AboutUs />
        <Footer />
    </div>
  )
}

export default AboutUsPage