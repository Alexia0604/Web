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

    const validatePassword = (password) => {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) {
            errors.push(`Parola trebuie să aibă cel puțin ${minLength} caractere`);
        }
        if (!hasUpperCase) {
            errors.push('Parola trebuie să conțină cel puțin o literă mare');
        }
        if (!hasLowerCase) {
            errors.push('Parola trebuie să conțină cel puțin o literă mică');
        }
        if (!hasNumbers) {
            errors.push('Parola trebuie să conțină cel puțin o cifră');
        }
        if (!hasSpecialChar) {
            errors.push('Parola trebuie să conțină cel puțin un caracter special (!@#$%^&*(),.?":{}|<>)');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        // Validare parolă
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setFormError(passwordErrors.join('\n'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError('Parolele nu coincid');
            return;
        }
        
        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
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
                    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 shadow-xl">
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
                                    placeholder="Nume utilizator"
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
                            
                            {/* parolă */}
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
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;