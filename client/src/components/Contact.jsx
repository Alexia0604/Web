import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="min-h-screen bg-cover bg-center relative" 
    style={{ backgroundImage: "url('/images/background2.jpg')" }}>
      
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <motion.div 
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* titlu */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12 uppercase tracking-wide">
            Informații de contact
          </h1>

          {/* detalii contact */}
          <div className="bg-white bg-opacity-90 rounded-lg p-8 shadow-xl">
            <div className="space-y-6">
              {/* telefon */}
              <div className="flex items-center">
                <svg className="w-6 h-6 text-teal-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-lg text-gray-800">Telefon: 0767.573.330</p>
              </div>

              {/* companie */}
              <div className="flex items-center">
                <svg className="w-6 h-6 text-teal-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-lg text-gray-800">BirdHub  SRL</p>
              </div>

              {/* email */}
              <div className="flex items-center">
                <svg className="w-6 h-6 text-teal-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-lg text-gray-800">
                  <a href="mailto:secretariat@produse-complexe.ro" className="text-teal-600 hover:text-teal-800">
                    contact@birdhub.com
                  </a>
                </p>
              </div>

              {/* adresa */}
              <div className="flex items-center">
                <svg className="w-6 h-6 text-teal-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg text-gray-800">
                Bd. George Coșbuc, nr. 39-49, București, sector 5, 050141 
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;