import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const featureItems = [
    {
      title: "Enciclopedie",
      description: "Descoperă sute de specii de păsări cu informații detaliate și imagini HD.",
      icon: "🔍",
      path: "/encyclopedia",
      image: "/Images/enciclopedie.jpg"
    },
    {
      title: "Căutare Avansată",
      description: "Găsește păsări după culoare, habitat, mărime și alte caracteristici specifice.",
      icon: "🔎",
      path: "/search",
      image: "/Images/cautare_avansata.png"
    },
    {
      title: "Jocuri Educative",
      description: "Testează-ți cunoștințele despre păsări prin jocuri interactive și amuzante.",
      icon: "🎮",
      path: "/games",
      image: "/Images/quiz.jpg"
    }
  ];

  // Funcția de scroll pentru săgeată
  const scrollToFeatures = () => {
    document.getElementById('features-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen">
      
      {/* Hero section cu video background */}
      <div className="relative h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            className="absolute min-w-full min-h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/Images/video4.mp4" type="video/mp4" />
            {/* Fallback pentru browser-uri care nu suportă video */}
            <div className="absolute inset-0 bg-blue-400"></div>
          </video>
          {/* Overlay pentru a asigura lizibilitatea textului */}
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4">
        
          <motion.h1 
            className="text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Bine ai venit la <span className="text-blue-300">BirdHub</span>!
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white max-w-2xl mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Explorează lumea fascinantă a păsărilor într-un mod interactiv și captivant
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/encyclopedia">
              <motion.button 
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explorează Enciclopedia
              </motion.button>
            </Link>
            <Link to="/games">
              <motion.button 
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Joacă și Învață
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator cu funcționalitate */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={scrollToFeatures}
        >
          <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </motion.div>
      </div>
      
      {/* Secțiunea de caracteristici îmbunătățită cu card-uri moderne */}
      <div id="features-section" className="py-24 bg-gradient-to-b from-white to-blue-50">
        {/* Wave separator */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-blue-700 bg-blue-100 rounded-full text-sm font-semibold mb-4">CARACTERISTICI</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Descoperă Platformă Noastră
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              BirdHub îți oferă toate instrumentele necesare pentru a explora și 
              înțelege lumea fascinantă a păsărilor.
            </p>
          </div>
          
          <div className="mt-20">
            {featureItems.map((item, index) => (
              <motion.div
                key={index}
                className={`flex flex-col lg:flex-row items-center mb-20 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {/* Imagine - Ajustată pentru dimensionare automată */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-10' : 'lg:pl-10'} mb-10 lg:mb-0`}>
                  <motion.div 
                    className="relative rounded-2xl overflow-hidden shadow-2xl group h-80"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="inline-block bg-blue-600 text-white p-3 rounded-full mb-4">
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Conținut */}
                <div className="lg:w-1/2">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-xl text-gray-600 mb-6">{item.description}</p>
                  
                  {/* Listă de beneficii */}
                  <ul className="space-y-4 mb-8">
                    {[1, 2, 3].map((bullet, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-6 h-6 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          {item.title === "Enciclopedie" && i === 0 && "Informații detaliate despre habitate și comportamente"}
                          {item.title === "Enciclopedie" && i === 1 && "Galerii foto HD pentru fiecare specie"}
                          {item.title === "Enciclopedie" && i === 2 && "Fișe descriptive complete și actualizate"}
                          
                          {item.title === "Căutare Avansată" && i === 0 && "Filtrare după culoare, mărime și habitat"}
                          {item.title === "Căutare Avansată" && i === 1 && "Comparație între specii similare"}
                          
                          {item.title === "Jocuri Educative" && i === 0 && "Quiz-uri interactive pentru toate vârstele"}
                          {item.title === "Jocuri Educative" && i === 1 && "Provocări de recunoaștere vizuală și auditivă"}
                          {item.title === "Jocuri Educative" && i === 2 && "Tabele de clasament"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={item.path}>
                    <motion.button 
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explorează {item.title}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section cu design modern și gradient */}
      <div className="relative overflow-hidden py-24">
        {/* Gradient de fundal */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-800"></div>
        
        {/* Design elements - cercuri decorative */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-xl"></div>
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-indigo-300 opacity-10 rounded-full blur-md"></div>
        </div>

        {/* Separator ondulat superior */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 text-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity="0.25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ffffff" opacity="0.5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"></path>
          </svg>
        </div>
        
        {/* Container pentru conținut */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Secțiunea Text */}
            <div className="lg:w-1/2 lg:pr-16 mb-12 lg:mb-0 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Pregătit să descoperi <br />
                <span className="text-blue-200">lumea păsărilor?</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Creează un cont gratuit și începe să explorezi sute de specii de păsări din întreaga lume într-un mod interactiv și captivant.
              </p>
              <Link to="/signup">
                <motion.button 
                  className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Înregistrează-te Gratuit
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </Link>
              
              {/* Counter stats */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-blue-200">Specii</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-blue-200">Imagini</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">100+</div>
                  <div className="text-sm text-blue-200">Habitate</div>
                </div>
              </div>
            </div>
            
            {/* Secțiunea Imagine - Ajustată pentru a încadra perfect imaginea */}
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 h-96">
                <img 
                  src="/Images/pagina_principala.jpg" 
                  alt="Păsări în natură" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent"></div>
              </div>
              
              {/* Design element - cercuri decor în jurul imaginii */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 opacity-30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
        
        {/* Separator ondulat inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 text-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity="0.25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ffffff" opacity="0.5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"></path>
          </svg>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="mt-2 text-blue-200">© 2025 BirdHub</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;