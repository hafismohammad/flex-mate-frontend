import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Use axios instead of the authenticated instance
import API_URL from "../../../axios/API_URL";

function Features({ servicesRef }) {
  const [specializations, setSpecializations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 600, 
      delay: 50,     
      easing: "ease-out-quart",
      once: true,
    });
  }, []);

  useEffect(() => {
    const getAllSpecializations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/user/specializations`);
        const listedSpecializations = response.data.filter(spec => spec.isListed);
        setSpecializations(listedSpecializations);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };
    getAllSpecializations();
  }, []);

  const handleClick = (specId) => {
    navigate(`/trainers/${specId}`);
  };

  return (
    <div ref={servicesRef} className="bg-slate-100 rounded-md p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-10 mt-16 text-center">Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {specializations.length > 0 &&
          specializations.map((feature) => (
            <div 
              key={feature._id}
              className="flex flex-col justify-between h-full bg-white w-full max-w-xs mx-auto rounded-md shadow-md hover:shadow-[0px_10px_20px_-5px_rgba(0,0,0,0.4)] duration-300"
              data-aos="fade-up"
              data-aos-offset="200"
            >
              <div className="overflow-hidden rounded-t-md">
                <img
                  className="w-full h-40 object-cover"
                  src={feature.image}
                  alt={feature.title}
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex-grow">
                <h2 className="text-lg font-semibold mb-1 text-gray-900">
                  {feature.name}
                </h2>
                <p className="text-gray-700 text-sm">{feature.description}</p>
              </div>
              <div className="p-3">
                <button onClick={() => handleClick(feature._id)} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
                  View {feature.name} Trainers
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Features;
