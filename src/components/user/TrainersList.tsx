import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trainer } from "../../types/trainer";
import axios from "axios";
import API_URL from "../../../axios/API_URL";

function TrainersList() {
  const [trainersData, setTrainersData] = useState<Trainer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayLimit, setDisplayLimit] = useState(6);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAllTrainers = async () => {
      try {
        const response = await axios.get<Trainer[]>(
          `${API_URL}/api/user/trainers`
        );
        const trainers = response.data;
        const params = new URLSearchParams(location.search);
        const selectedGender = params.get("gender")?.toLowerCase();
        const selectedLanguage = params.get("language")?.toLowerCase();
        const selectedSpecialization = params.get("specialization");

        const filteredTrainers = trainers.filter((trainer) => {
          const matchesGender = selectedGender
            ? trainer.gender?.toLowerCase() === selectedGender
            : true;
          const matchesLanguage = selectedLanguage
            ? Array.isArray(trainer.language)
              ? trainer.language?.some(
                  (lang) => lang.toLowerCase() === selectedLanguage
                )
              : trainer.language?.toLowerCase() === selectedLanguage
            : true;
          const matchesSpecialization = selectedSpecialization
            ? trainer.specializations?.some(
                (spec) => spec._id === selectedSpecialization
              )
            : true;
          return matchesGender && matchesLanguage && matchesSpecialization;
        });

        setTrainersData(filteredTrainers);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };

    fetchAllTrainers();
  }, [location.search]);

  const filteredTrainers = trainersData.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specializations.some((spec) =>
        spec.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleTrainerProfileView = (trainerId: string) => {
    navigate(`/trainer-profile/${trainerId}`);
  };

  const handleLoadMore = () => {
    setDisplayLimit((prevLimit) => prevLimit + 6); 
  };

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-center items-center mb-16">
        <input
          type="text"
          placeholder="Search Trainers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border w-[60%] border-gray-300 rounded-lg shadow-sm focus:outline-none"
        />
      </div>
      <div
        className="grid grid-cols-1 w-[95%] sm:grid-cols-2 md:grid-cols-3 gap-6"
        style={{ minHeight: "300px" }}
      >
        {filteredTrainers.slice(0, displayLimit).map((trainer: Trainer) => (
          <div
            key={trainer._id}
            className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 hover:shadow-[0px_10px_20px_-5px_rgba(0,0,0,0.4)] duration-300 flex flex-col justify-between"
          >
            <img
              src={trainer.profileImage}
              alt="Profile"
              className="w-full h-48 object-cover"
            />
            <div className="p-3 flex-grow flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">
                {trainer.name}
              </h3>
              <div className="text-gray-600 flex justify-start mt-3 space-x-2">
                {trainer.specializations.map((spec) => (
                  <p className="bg-blue-100 rounded-xl text-sm " key={spec._id}>
                    {spec.name}
                  </p>
                ))}
              </div>
              <button
                onClick={() => handleTrainerProfileView(trainer._id)}
                className="bg-blue-500 mt-5 hover:bg-blue-600 text-white py-2 px-4 rounded self-start"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTrainers.length > displayLimit && (
          <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
          >
            Load More Trainers
          </button>
        </div>
      )}

      {filteredTrainers.length === 0 && (
        <div className="flex items-center justify-center col-span-full mt-10">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-4">
              Sorry, we couldn’t find any trainers that matched your criteria.
            </h1>
            <p className="text-gray-600">
              Try removing some of your search filters. <br />
              (Helpful tip: You can book different trainers to mix up your
              routine.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainersList;
