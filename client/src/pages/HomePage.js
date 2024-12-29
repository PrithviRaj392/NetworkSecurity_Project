import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ntru from 'ntru-legacy';


const privateKeyBase64 = 'AgMABhC81oXhzS2s7AxOyCbt/52ZwYtI+gizH/nMsiaHeQU7edPi8r8BFJnrSg9Ib9RvGrRSWF63Au0sYByktmuEvN42Wub8szeJ7zA8WzbWNcgnDR6tnQePL1v+/SYj4uOsU6tMMVlhoHg39Wl64OSv5hGVGq/MVk7mgqD7AT/Bo5BV5ibjs20AUC+RHW09traQE20N46TQEEG/Dh7huN0fbcHCL/0IP+W30M2wxjburd0NsWHI2ldrr6lFwIB5iO2ELQJBBeTYn5/kHZktEwAl/O60LSutI1Y+EdPte9jlIUsSU5y6MzEpeo+irytXIE1ZCyUs8W8KiW4pWeWrAgf90He+NXB54Gi92cGl48xGAbgK60f53vunz2v8OG9mkdZFPC4snEvYGvnYw1yFBUa/a2VQtuNEvzSURsKgxjQ/3BiyC47GkQ12ANbiq0gfYYg8dS+GfEFsx7vrXf+F0LIcZgOPijQvhXJeSx7S7jCTyDtDBLGYRkt6HQto1Ivsvs2MN8j4ZkaDHEj3SItjmVj/ueD/0ek4NHjvmHUuDUlKTt6vEvI916Di24U3sWvCe0fH5Iknov7iKOgMnXslQwrIf1KK03VpU2qaOUl078ArhMB10wZ91OH4ZAZwotrKDz1jQQrsdAH3wXWw4w+xwtxJuqWldEr5iEhoa2vJk3oonTXYVxLqE0VAO/QatOQz9LOPsMHNVzys3Wm7p8W3AtgwXa5gQVHZN54LhUGPx/r72i5HyhM0bTlxhUXYgqBhzotoOCAJ4ovvOXI1R8phf/xPnvd7cXCodKQXJMJVfdmumlMbGVAntYd2GBjCkf4JCES12Xlp9MoMZRPFm8dtqmxrvbo10Xa3YDieXoH6Un3Ds1k0pDdQnG4pGw2yU/k9266nAAzwlWQOzGuNpt5KRWhtSueauvGdFY+H8Km6A5AgFetPlN7EgWDsQ7xP/uw32F6H4uK9URt5V+tvMaZ9W3fSJa8acN1pphVkm0lph2mQ0fiWGXdhS9Ki9y40iJj7CpPoIjCsskH5hL+jQ22ocXrnwb3LsasfIuTGJZr4RU+m5O1FlUpVJ9kobMaOp/KGZK6kxCrgVGytJwXxfZ/7LVXUUpgVGAzYJr1NpVh1fkJ7o55LgfGjiR/eSnJIaYlZEADYsYvUm+zxqYpN4kCVjbP4bic+R2ZoV8DaQ+XlnirAy1AnzF5uytex1rbs+tDH8a0Gq5wVGVPN6lrNeDBq8DqygaZm9dQiTMDYC6+iV/UCN82kvdYSLvycSu0VtTbCxBBK2ZFMxhgAXxVwa6L4NS2mCX1kquAssYObbp6GNjdqPo4o5XYTE+hTlk5ctM7CR4dO9rY41YVQWH8Rhvk+4fLEABELQ5n2fQ3rkbUuiNMRrxoaRxbXdCjoxD2mUSC9/TNUswgYM+VSPQ0+qNtRUyUDFwlnklGUTo6Xp4ay0J9N4zIJY2oiYCc1QPABxxdqswaHi2SjcLudq2TyP4iLEA==';
const privateKey = new Uint8Array(atob(privateKeyBase64).split('').map(char => char.charCodeAt(0)));

function uint8ArrayToBase64(uint8Array) {
  const binaryString = String.fromCharCode.apply(null, uint8Array);
  return btoa(binaryString);
}

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  // const [privateKey, setPrivateKey] = useState(null);

  // Load the private key from a file stored on the frontend
  const loadPrivateKey = async () => {    
    try {
      // const response = await fetch('/private_key.bin');
      // const privateKeyArrayBuffer = await response.arrayBuffer();
      // setPrivateKey(new Uint8Array(privateKeyArrayBuffer));
      console.log("Private Key Loaded:", privateKey);
    } catch (error) {
      console.error('Failed to load private key:', error);
    }
  };
  
  useEffect(() => {
    loadPrivateKey();
  }, []);

  const authenticationRequest = async (encryptedChallengeBase64) => {
    try {
      if (!privateKey || !encryptedChallengeBase64) {
        console.error('Private key or encrypted challenge not available!');
        return;
      }
      const encryptedChallengeValue = new Uint8Array(atob(encryptedChallengeBase64).split('').map(char => char.charCodeAt(0)));
      const decryptedChallengeValue = await ntru.decrypt(encryptedChallengeValue, privateKey);
      console.log('Decrypted Challenge Value:', decryptedChallengeValue);

      // const encryptedChallengeValueWithPrivateKey = await ntru.encrypt(decryptedChallengeValue, privateKey);
      const response = await axios.post('http://localhost:5000/challenge', { challengeResponse: uint8ArrayToBase64(decryptedChallengeValue) });

      if (response.data.authenticated) {
        setIsAuthenticated(true);
        navigate('/restricted_page');
      } else {
        alert('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('An error occurred during authentication');
    } finally {
      setLoading(false); // Stop loading after the process is complete
    }
  };

  const handleLoginButtonClick = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/authenticate');
      await authenticationRequest(response.data.encryptedChallenge);
    } catch (error) {
      console.error('Failed to initiate authentication:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-900">Welcome to Home Page</h1>
        <div className="mt-6 text-center">
          <button
            onClick={handleLoginButtonClick}
            className={`w-full py-2 px-4 rounded-lg text-white ${isAuthenticated ? 'bg-green-600' : 'bg-blue-600'} hover:bg-opacity-90 transition duration-300`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isAuthenticated ? 'Authenticated' : 'Log In'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Click the button to authenticate and access restricted content.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
