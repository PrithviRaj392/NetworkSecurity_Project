import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import HomePage component
import RestrictedPage from './pages/RestrictedPage'; // Import RestrictedPage component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restricted_page" element={<RestrictedPage />} />
      </Routes>
    </Router>
  );
};

export default App;
