import { useNavigate } from 'react-router-dom';
import bgImg from '../../assets/card-2.jpg';

function AboutUs() {
    const navigte = useNavigate()
    const handleGetStart = () => {
        navigte('/trainers')
    } 
  return (
    <div className="relative bg-blue-50">
      <div className="relative">
        <img src={bgImg} alt="Fitness background" className="w-full h-96 object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-50">
          <h1 className="text-white text-5xl font-bold drop-shadow-lg mb-4">
            About Us: Empowering Your Fitness Journey
          </h1>
        </div>
      </div>

      <div className="py-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">What We Do</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Flex Mate is a virtual fitness coaching platform connecting you with certified trainers for personalized sessions, anywhere, anytime. 
          We aim to make fitness accessible for everyone.
        </p>
      </div>

      <div className="py-8 px-4 text-center bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Mission and Vision</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          <strong>Our Mission:</strong> To inspire healthier lifestyles through flexible, expert-led fitness coaching. <br />
          <strong>Our Vision:</strong> To create a world where fitness is accessible and personalized for everyone.
        </p>
      </div>

      <div className="py-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Start Your Journey with Us</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Join thousands of users transforming their lives with the guidance of expert trainers. Sign up today!
        </p>
        <button onClick={handleGetStart} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default AboutUs;
