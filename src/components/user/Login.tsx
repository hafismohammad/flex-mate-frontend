import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg_img from "../../assets/login-img.jpg";
import logo from "../../assets/LOGO-3 (2).png";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { loginUser } from "../../actions/userAction";
import { Toaster, toast } from "react-hot-toast";

interface Errors {
  email?: string;
  password?: string;
}

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { userInfo, error } = useSelector((state: RootState) => state.user);

  const validate = (): Errors => {
    const newErrors: Errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Please fill the email field";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Valid email is required";
    }

    if (!password.trim()) {
      newErrors.password = "Please fill the password field";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const clearErrors = () => {
    setTimeout(() => {
      setErrors({});
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const formErrors = validate();
    setErrors(formErrors);
  
    if (Object.keys(formErrors).length > 0) {
      clearErrors();
      return;
    }
  
    setErrors({});
  
    const userData = {
      email,
      password,
    };
  
    dispatch(loginUser(userData))
      .unwrap()
      .then(() => {
        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      })
      .catch((error: any) => {
        if (error?.message === "User is blocked") {
          toast.error("Your account is blocked.");
        } else if (error?.message === "Invalid email or password") {
          toast.error("Invalid email or password.");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      });
  };
  
  

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Toaster />
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-4xl">
        <div
          className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bg_img})`,
          }}
        >
          <h2 className="text-xl lg:text-2xl font-bold text-white text-center">
            Welcome Back!
          </h2>
          <p className="text-white text-center">
            Log in to continue your journey with FlexMate.
          </p>
        </div>
        <div className="w-full lg:w-1/2 p-8 overflow-y-auto">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="w-21 h-10" />
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-center lg:text-left">
            Login
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-500 hover:underline">
                  Signup
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
