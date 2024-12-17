import WorkFlowImg from "../../assets/work-flow-banner.jpg";
import BottomBanner from "../../assets/Bottom-banner-2.jpg";
import LOGO from '../../assets/LOGO-3 (2).png'

function WorkFlow() {
  return (
    <div>
      <div>
        <h1 className="text-4xl font-bold mb-14 mt-20 text-center">
          How It Works
        </h1>
      </div>
      <div className="mb-40">
        <img className="w-full" src={WorkFlowImg} alt="work-flow" />
      </div>
      <div className="relative flex items-center justify-center w-full h-full">
        <img className="w-full h-auto" src={BottomBanner} alt="bottom-banner" />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">

          <div className="flex items-center justify-center mb-4 ">
            <img
              src={LOGO} 
              alt="logo"
              className="w-max h-24 object-contain mr-4"
            />
          </div>

          <p className="text-2xl lg:text-3xl font-semibold">
            Unlock Your Full Potential with Personalized Coaching
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkFlow;
