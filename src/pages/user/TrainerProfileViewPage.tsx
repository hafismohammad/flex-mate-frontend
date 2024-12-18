import TrainerProfileView from "../../components/user/TrainerProfileView"
import Header from "../../components/user/Header"
import Footer from "../../components/user/Footer"
import { useRef } from "react";

function TrainerProfileViewPage() {
    const servicesRef = useRef<HTMLDivElement>(null);
  
    const scrollToServices = () => {
      servicesRef.current?.scrollIntoView({ behavior: "smooth" });
      console.log('servicesRef',servicesRef)
    };
  
  return (
    <div>
        <Header  scrollToServices={scrollToServices} />
        <TrainerProfileView />
        <Footer />
    </div>
  )
}

export default TrainerProfileViewPage