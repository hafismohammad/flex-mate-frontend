import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { addSpecialization } from "../../actions/adminAction";
import adminAxiosInstance from "../../../axios/adminAxiosInstance";
import Loading from "../spinner/Loading";

interface Errors {
  name?: string;
  description?: string;
}

interface Specialization {
  _id: string;
  name: string;
  description: string;
  image: string;
  isListed: boolean;
}

const Specializations = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const getAllSpecializations = async () => {
    setLoading(true); // Start loading
    try {
      const response = await adminAxiosInstance.get(
        `/api/admin/specialization`
      );
      setSpecializations(response.data);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    getAllSpecializations();
  }, []);

  const filteredSpecializations = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setName("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
  };

  const validate = (): boolean => {
    let isValid = true;
    const newErrors: Errors = {};

    if (!name.trim()) {
      newErrors.name = "Please fill the name field";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Please fill the description field";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      setTimeout(() => {
        setErrors({});
      }, 3000);
    }

    return isValid;
  };

  const handleStatus = async (specId: string, currentStatus: boolean) => {
    try {
      const updatedStatus = !currentStatus;
      const response = await adminAxiosInstance.patch(
        `/api/admin/toggle-status/${specId}`,
        {
          isListed: updatedStatus,
        }
      );

      if (response.status === 200 && response.data && response.data.data) {
        const updatedSpec = response.data.data;
        setSpecializations((prevSpecializations) =>
          prevSpecializations.map((spec) =>
            spec._id === specId
              ? { ...spec, isListed: updatedSpec.isListed }
              : spec
          )
        );
      } else {
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error updating specialization status:", error);
    }
  };

  const handleAddSpecialization = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true); // Start loading
      const response = await dispatch(addSpecialization({ formData }));
      if (response.payload && response.payload.specialization) {
        const newSpecialization = response.payload.specialization;
        setSpecializations((prevSpecializations) => [
          ...prevSpecializations,
          newSpecialization,
        ]);
      }

      closeModal();
    } catch (error) {
      console.error("Error adding specialization:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-gray-800">Specializations</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search Specializations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={openModal}
            className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPlus />
            <span>Add Specialization</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-4 text-lg font-semibold text-gray-600 mb-4 border-b border-gray-200 pb-2">
          <div>ID</div>
          <div>Specialization</div>
          <div>Status</div>
          <div className="text-center">Action</div>
        </div>

        {filteredSpecializations.length > 0 ? (
          filteredSpecializations.map((spec) => (
            <div
              key={spec._id}
              className="grid grid-cols-4 items-center p-4 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-none"
            >
              <div className="text-gray-800 font-medium">
                {spec._id.substring(0, 8).toUpperCase()}
              </div>
              <div className="text-gray-800 font-medium">{spec.name}</div>
              <div
                className={`font-semibold ${
                  spec.isListed ? "text-green-600" : "text-red-500"
                }`}
              >
                {spec.isListed ? "Active" : "Inactive"}
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleStatus(spec._id, spec.isListed)}
                  className={`flex items-center justify-center text-white py-2 px-5 rounded-md font-semibold focus:outline-none ${
                    spec.isListed
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  style={{ minWidth: "120px" }}
                >
                  <span>{spec.isListed ? "Unlist" : "List"}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-6">
            No specializations found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">

            <h3 className="text-2xl font-bold mb-4">Add New Specialization</h3>
            {loading && <Loading />}
            <form onSubmit={handleAddSpecialization}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter specialization name"
                className={`w-full p-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.name && (
                <div className="text-red-500 mb-2">{errors.name}</div>
              )}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter specialization description"
                className={`w-full p-2 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.description && (
                <div className="text-red-500 mb-2">{errors.description}</div>
              )}
              <label
                htmlFor="uploadFile1"
                className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-sans relative"
                style={{
                  backgroundImage: imagePreview
                    ? `url(${imagePreview})`
                    : "none",
                  backgroundSize: "cover",
                  // backgroundPosition: "center",
                }}
              >
                {!imagePreview && (
                  <>
                    Upload file
                    <p className="text-xs font-medium text-gray-400 mt-2">
                      PNG, JPG, SVG, WEBP, and GIF are Allowed.
                    </p>
                  </>
                )}
                <input
                  onChange={handleChanges}
                  type="file"
                  id="uploadFile1"
                  className="hidden"
                />
              </label>

              <div className="flex justify-end mt-7">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 mr-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Specialization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specializations;
