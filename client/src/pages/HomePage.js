import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ntru from "ntru-legacy";
import { dilithium } from "dilithium-crystals";

function uint8ArrayToBase64String(uint8Array) {
  return btoa(String.fromCharCode.apply(null, uint8Array));
}

function base64StringToUint8Array(base64String) {
  return new Uint8Array(
    atob(base64String)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
}

const ntruPrivateKeyBase64 =
  "AgMABhC81oXhzS2s7AxOyCbt/52ZwYtI+gizH/nMsiaHeQU7edPi8r8BFJnrSg9Ib9RvGrRSWF63Au0sYByktmuEvN42Wub8szeJ7zA8WzbWNcgnDR6tnQePL1v+/SYj4uOsU6tMMVlhoHg39Wl64OSv5hGVGq/MVk7mgqD7AT/Bo5BV5ibjs20AUC+RHW09traQE20N46TQEEG/Dh7huN0fbcHCL/0IP+W30M2wxjburd0NsWHI2ldrr6lFwIB5iO2ELQJBBeTYn5/kHZktEwAl/O60LSutI1Y+EdPte9jlIUsSU5y6MzEpeo+irytXIE1ZCyUs8W8KiW4pWeWrAgf90He+NXB54Gi92cGl48xGAbgK60f53vunz2v8OG9mkdZFPC4snEvYGvnYw1yFBUa/a2VQtuNEvzSURsKgxjQ/3BiyC47GkQ12ANbiq0gfYYg8dS+GfEFsx7vrXf+F0LIcZgOPijQvhXJeSx7S7jCTyDtDBLGYRkt6HQto1Ivsvs2MN8j4ZkaDHEj3SItjmVj/ueD/0ek4NHjvmHUuDUlKTt6vEvI916Di24U3sWvCe0fH5Iknov7iKOgMnXslQwrIf1KK03VpU2qaOUl078ArhMB10wZ91OH4ZAZwotrKDz1jQQrsdAH3wXWw4w+xwtxJuqWldEr5iEhoa2vJk3oonTXYVxLqE0VAO/QatOQz9LOPsMHNVzys3Wm7p8W3AtgwXa5gQVHZN54LhUGPx/r72i5HyhM0bTlxhUXYgqBhzotoOCAJ4ovvOXI1R8phf/xPnvd7cXCodKQXJMJVfdmumlMbGVAntYd2GBjCkf4JCES12Xlp9MoMZRPFm8dtqmxrvbo10Xa3YDieXoH6Un3Ds1k0pDdQnG4pGw2yU/k9266nAAzwlWQOzGuNpt5KRWhtSueauvGdFY+H8Km6A5AgFetPlN7EgWDsQ7xP/uw32F6H4uK9URt5V+tvMaZ9W3fSJa8acN1pphVkm0lph2mQ0fiWGXdhS9Ki9y40iJj7CpPoIjCsskH5hL+jQ22ocXrnwb3LsasfIuTGJZr4RU+m5O1FlUpVJ9kobMaOp/KGZK6kxCrgVGytJwXxfZ/7LVXUUpgVGAzYJr1NpVh1fkJ7o55LgfGjiR/eSnJIaYlZEADYsYvUm+zxqYpN4kCVjbP4bic+R2ZoV8DaQ+XlnirAy1AnzF5uytex1rbs+tDH8a0Gq5wVGVPN6lrNeDBq8DqygaZm9dQiTMDYC6+iV/UCN82kvdYSLvycSu0VtTbCxBBK2ZFMxhgAXxVwa6L4NS2mCX1kquAssYObbp6GNjdqPo4o5XYTE+hTlk5ctM7CR4dO9rY41YVQWH8Rhvk+4fLEABELQ5n2fQ3rkbUuiNMRrxoaRxbXdCjoxD2mUSC9/TNUswgYM+VSPQ0+qNtRUyUDFwlnklGUTo6Xp4ay0J9N4zIJY2oiYCc1QPABxxdqswaHi2SjcLudq2TyP4iLEA==";
const dilithiumPrivateKeyBase64 =
  "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";
const ntruPrivateKey = base64StringToUint8Array(ntruPrivateKeyBase64);
const dilithiumPrivateKey = base64StringToUint8Array(dilithiumPrivateKeyBase64);

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const authenticationRequest = async (encryptedChallengeBase64) => {
    try {
      if (!ntruPrivateKey || !encryptedChallengeBase64) {
        console.error("Private key or encrypted challenge not available!");
        return;
      }
      const encryptedChallengeValue = base64StringToUint8Array(
        encryptedChallengeBase64
      );
      const decryptedChallengeValue = await ntru.decrypt(
        encryptedChallengeValue,
        ntruPrivateKey
      );
      const signature = await dilithium.signDetached(
        decryptedChallengeValue,
        dilithiumPrivateKey
      );
      console.log("Decrypted Challenge Value:", decryptedChallengeValue);

      const response = await axios.post("http://localhost:5000/challenge", {
        challengeResponseBase64: uint8ArrayToBase64String(
          decryptedChallengeValue
        ),
        signatureBase64: uint8ArrayToBase64String(signature),
      });

      if (response.data.authenticated) {
        setIsAuthenticated(true);
        // Store the authenticated status in localStorage
        localStorage.setItem("isAuthenticated", "true");
        navigate("/restricted_page");
      } else {
        alert("Authentication failed");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      alert("An error occurred during authentication");
    } finally {
      setLoading(false); // Stop loading after the process is complete
    }
  };

  const handleLoginButtonClick = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/authenticate");
      await authenticationRequest(response.data.encryptedChallenge);
    } catch (error) {
      console.error("Failed to initiate authentication:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-900">
          Welcome to Home Page
        </h1>
        <div className="mt-6 text-center">
          <button
            onClick={handleLoginButtonClick}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              isAuthenticated ? "bg-green-600" : "bg-blue-600"
            } hover:bg-opacity-90 transition duration-300`}
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : isAuthenticated
              ? "Authenticated"
              : "Log In"}
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Click the button to authenticate and access restricted content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
