import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import HomePage component
import RestrictedHomePage from './pages/RestrictedHomePage'; // Import RestrictedPage component
import RestrictedBankPage from './pages/RestrictedBankPage'; // Import RestrictedBankPage component


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restricted_home_page" element={<RestrictedHomePage />} />
        <Route path="/restricted_bank_page" element={<RestrictedBankPage />} />
      </Routes>
    </Router>
  );
};

export default App;
