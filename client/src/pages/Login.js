import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        try {
            const response = await login({
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe
            });
            
            console.log('Login response:', response);
            
            // Verificăm rolul utilizatorului
            if (response.user) {
                console.log('User role from login:', response.user.role);
                
                // Așteptăm puțin să se actualizeze starea
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Redirecționăm în funcție de rol
                if (response.user.role === 'admin') {
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin');
                } else {
                    console.log('Redirecting to home page');
                    navigate('/');
                }
            } else {
                console.error('No user object in response:', response);
                setFormError('Eroare de autentificare: informații utilizator lipsă');
            }
        } catch (error) {
            console.error('Login error:', error);
            setFormError(error.response?.data?.message || 'Eroare la autentificare. Verificați datele și încercați din nou.');
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center relative" 
             style={{ backgroundImage: "url('/images//background2.jpg')"  }}>
            
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            <div className="relative z-10 flex justify-center items-center min-h-screen pt-20 pb-12 px-4">
                <motion.div 
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* link catre signup */}
                    <div className="text-center mb-6">
                        <p className="text-white">
                            Nu ai un cont? <Link to="/signup" className="text-indigo-300 hover:text-indigo-100 font-medium">Înregistrează-te</Link>
                        </p>
                    </div>
                    
                    {/* formular de autentificare */}
                    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 shadow-xl">
                        <h2 className="text-3xl font-bold text-white text-center mb-8">
                            Autentificare
                        </h2>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-500 bg-opacity-50 text-white rounded-lg">
                                {formError}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            {/* email */}
                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-0 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:bg-opacity-30 focus:outline-none"
                                    required
                                />
                            </div>
                            
                            {/* parolă */}
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Parolă"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-0 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:bg-opacity-30 focus:outline-none"
                                    required
                                />
                            </div>
                            
                            {/* remember me si forgot password */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded bg-white bg-opacity-20"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                                        Ține-mă minte
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-indigo-300 hover:text-indigo-100">
                                        Ai uitat parola?
                                    </Link>
                                </div>
                            </div>
                            
                            {/* buton de autentificare */}
                            <motion.button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Autentificare
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;