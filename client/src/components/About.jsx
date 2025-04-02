import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-cover bg-center relative" 
    style={{ backgroundImage: "url('/images/background2.jpg')" }}>
      {/* efect de transparenta */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <motion.div 
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* titlu */}
          <h1 className="text-5xl font-bold text-white text-center mb-12 uppercase tracking-wide">
            Despre Noi
          </h1>

          {/* descriere */}
          <div className="bg-white bg-opacity-90 rounded-lg p-8 shadow-xl">
            <p className="text-lg text-gray-700 leading-relaxed">
            BirdHub este o platformă dedicată pasionaților de natură și ornitologie, având scopul de a facilita explorarea și înțelegerea lumii fascinante a păsărilor. Misiunea noastră este să oferim un spațiu interactiv și educativ, unde utilizatorii pot descoperi sute de specii de păsări prin enciclopedii detaliate, căutări avansate bazate pe caracteristici precum culoarea, habitatul sau aspectul, precum și jocuri educative captivante. Echipa noastră se dedică creării unei experiențe prietenoase și accesibile, inspirând iubitorii de păsări să învețe, să exploreze și să protejeze biodiversitatea aviaună. BirdHub este mai mult decât o aplicație – este o comunitate pentru cei care apreciază frumusețea zborului și cântecul păsărilor.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;