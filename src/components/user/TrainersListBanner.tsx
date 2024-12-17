import banner from '../../assets/trainers-tablet.jpg';

function TrainersListBanner() {
  return (
    <div className="relative">
      <img className="w-full h-auto" src={banner} alt="Trainers Banner" />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 animate-fade-up animate-once animate-duration-[2000ms]">
      <div className="absolute inset-0 bg-black bg-opacity-30  group-hover:bg-opacity-60 transition duration-300 "></div>

        <h1 className="text-white  md:text-4xl lg:text-6xl  font-bold drop-shadow-lg mb-4 ">
          Meet FlexMate fitness & <br /> wellness professionals
        </h1>
        <p className="text-white sm: text-sm lg:text-lg drop-shadow-md">
          Get expert health & fitness guidance for every experience level.
        </p>
      </div>

    </div>
  );
}

export default TrainersListBanner;
