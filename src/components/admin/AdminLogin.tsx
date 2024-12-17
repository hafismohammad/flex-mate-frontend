import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import {adminLogin} from '../../actions/adminAction'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface Errors {
  email?: string;
  password?: string;
}

function AdminLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()

  const {adminToken} = useSelector((state: RootState) => state.admin)

  useEffect(() => {
    if(adminToken) {
      navigate('/admin')
    }
  }, [adminToken, navigate])

  const validate = (): Errors => {
    const newErrors: Errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Please fill the email field';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Please fill the password field';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      clearErrors(); 
    } else {
     
      const adminData = {
        email,
        password,
      };


      dispatch(adminLogin(adminData));
      
      // navigate('/admin')

    }
  };

  return (
    <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
      <div className='bg-white w-[35%] h-[60vh] p-8 rounded-2xl shadow-lg'>
        <div className='mb-12'>
          <h1 className='text-2xl font-bold text-center'>Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='mb-7'>
            <label htmlFor="email" className='block text-gray-700 mb-2'>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter admin email'
              className='px-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className='mb-7'>
            <label htmlFor="password" className='block text-gray-700 mb-2'>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter admin password'
              className='px-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className=''>
            <button
              type='submit'
              className='w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200'
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
