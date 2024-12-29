import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RestrictedPage = () => {
  const navigate = useNavigate();

  // Check if the user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated || isAuthenticated !== "true") {
      navigate("/"); // Redirect to the homepage
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); // Remove authentication status
    navigate("/"); // Redirect to the homepage
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
          Restricted Page
        </h1>
        <p className="text-gray-700 text-lg">
          You are successfully logged in!
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/dashboard")} // Redirect to Dashboard
            className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 mr-4"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout} // Logout action
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestrictedPage;
