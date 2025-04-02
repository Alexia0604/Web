import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavyBar from './components/NavyBar';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <NavyBar />
          <div className="pt-16"> {/* Spațiu pentru navbar fix */}
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;