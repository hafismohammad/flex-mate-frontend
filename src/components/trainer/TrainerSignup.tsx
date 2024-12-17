import BG_IMG from "../../assets/trainers-tablet - Copy.jpg";
import LOGO from "../../assets/LOGO-3 (2).png";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchSpecializations, registerTrainer } from "../../actions/trainerAction";
import toast, { Toaster } from "react-hot-toast";

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  specialization?: string;
}

function TrainerSignup() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [specializations, setSpecializations] = useState<string[]>([]); 
  const [errors, setErrors] = useState<Errors>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const specializationsData = useSelector(
    (state: RootState) => state.trainer.specializations
  );
  const signupError = useSelector((state: RootState) => state.trainer.error);

  useEffect(() => {
    dispatch(fetchSpecializations());
  }, [dispatch]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSpecializationChange = (specialization: string) => {
    setSpecializations((prev) =>
      prev.includes(specialization)
        ? prev.filter((spec) => spec !== specialization)
        : [...prev, specialization]
    );
  };

  // Form validation
  const validate = (): Errors => {
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = "Please fill the name field";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Please fill the email field";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Valid email is required";
    }
    if (!phone.trim()) {
      newErrors.phone = "Please fill the phone field";
    } else if (!phone.match(/^\d{10}$/)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!password.trim()) {
      newErrors.password = "Please fill the password field";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (specializations.length === 0)
      newErrors.specialization = "Please select at least one specialization";
    return newErrors;
  };

  const clearErrors = () => {
    setTimeout(() => setErrors({}), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      clearErrors();
      return;
    }

    const trainerData = { name, email, phone, password, specializations };
    await dispatch(registerTrainer(trainerData));

    if (!signupError) {
      navigate("/trainer/otp", { state: trainerData });
    } else {
      toast.error(signupError);
    }
  };

  return (
<div className="min-h-screen bg-slate-100 flex items-center justify-center">
  <Toaster />
  <div
    className="w-full flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
    style={{ backgroundImage: `url(${BG_IMG})` }}
  >
    <div className="bg-white h-[88vh] w-[90%] md:w-[75%] max-w-3xl shadow-lg rounded-md overflow-y-auto relative">
      <div className="flex items-center justify-center space-x-4 p-5">
        <img className="w-32 h-14" src={LOGO} alt="logo" />
        <h1 className="font-bold text-3xl text-gray-800">Register Trainer</h1>
      </div>
      <form onSubmit={handleSubmit} className="mt-5 w-full gap-6 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Phone</label>
              <input
                type="text"
                className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Specialization</label>
              <div className="relative">
                <button
                  type="button"
                  className="border border-gray-300 p-2 rounded-md w-full text-left focus:ring-2 focus:ring-blue-500 transition-all"
                  onClick={toggleDropdown}
                >
                  {specializations.length > 0
                    ? specializations.join(", ")
                    : "Select Specializations"}
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg left-0 top-full">
                    {specializationsData.map((spec) => (
                      <div
                        key={spec.id}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleSpecializationChange(spec.name)}
                      >
                        <input
                          type="checkbox"
                          checked={specializations.includes(spec.name)}
                          readOnly
                        />
                        {spec.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-all duration-300"
          >
            Register
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/trainer/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  </div>
</div>



  );
}

export default TrainerSignup;
