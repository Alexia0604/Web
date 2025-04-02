import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        // Verificare dacă parolele coincid
        if (formData.password !== formData.confirmPassword) {
            setFormError('Parolele nu coincid');
            return;
        }
        
        // Validare parola
        if (formData.password.length < 6) {
            setFormError('Parola trebuie să conțină minim 6 caractere');
            return;
        }

        try {
            // Trimitem doar username, email și password (fără confirmPassword)
            const { confirmPassword, ...registerData } = formData;
            
            await register(registerData);
            
            // Redirecționare către pagina principală după înregistrare
            navigate('/');
        } catch (error) {
            setFormError(error.response?.data?.message || 'Eroare la înregistrare. Verificați datele și încercați din nou.');
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
                    {/* link către login */}
                    <div className="text-center mb-6">
                        <p className="text-white">
                            Ai deja un cont? <Link to="/login" className="text-indigo-300 hover:text-indigo-100 font-medium">Autentifică-te</Link>
                        </p>
                    </div>
                    
                    {/* formular de înregistrare */}
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-8 shadow-xl">
                        <h2 className="text-3xl font-bold text-white text-center mb-8">
                            Înregistrare
                        </h2>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-500 bg-opacity-50 text-white rounded-lg">
                                {formError}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            {/* username */}
                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Nume de utilizator"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-0 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:bg-opacity-30 focus:outline-none"
                                    required
                                />
                            </div>
                            
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
                            
                            {/* parola */}
                            <div className="relative mb-4">
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
                                    minLength={6}
                                />
                            </div>
                            
                            {/* confirmare parolă */}
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirmă parola"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-0 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:bg-opacity-30 focus:outline-none"
                                    required
                                    minLength={6}
                                />
                            </div>
                            
                            {/* buton de înregistrare */}
                            <motion.button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Înregistrare
                            </motion.button>
                        </form>
                        
                        {/* sau continuă cu */}
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 border-opacity-50"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-transparent text-white">Sau continuă cu</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <motion.button
                                    type="button"
                                    className="w-full flex justify-center py-2 px-4 border border-white border-opacity-40 rounded-lg text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                                    </svg>
                                    <span className="ml-2">Google</span>
                                </motion.button>
                                
                                <motion.button
                                    type="button"
                                    className="w-full flex justify-center py-2 px-4 border border-white border-opacity-40 rounded-lg text-white bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 2.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path>
                                    </svg>
                                    <span className="ml-2">GitHub</span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;