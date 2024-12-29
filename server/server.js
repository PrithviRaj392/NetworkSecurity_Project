const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const ntru = require("ntru-legacy");
const dilithium = require('dilithium-crystals');

// Initialize the app
const app = express();

// Use CORS middleware (optional)
app.use(cors());

// Middleware to parse JSON request body
app.use(bodyParser.json());



function uint8ArrayToBase64String(uint8Array) {
  return Buffer.from(uint8Array).toString("base64");
}

function base64StringToUint8Array(base64String) {
  return new Uint8Array(atob(base64String).split('').map(char => char.charCodeAt(0)));
}



// Define a challenge value (this is the original value to compare against)
const challengeValue = new Uint8Array([1, 2, 3]);

// Load the public key for encryption
let ntruPublicKey;
let dilithiumPublicKey;
try {
  const ntruPublicKeyBase64 = fs.readFileSync("./keys/ntru_public_key.txt");
  const dilithiumPublicKeyBase64 = fs.readFileSync("./keys/dilithium_public_key.txt");
  ntruPublicKey = base64StringToUint8Array(ntruPublicKeyBase64);
  dilithiumPublicKey = base64StringToUint8Array(dilithiumPublicKeyBase64);
} catch (error) {
  console.error("Error loading public key:", error);
}

// Encrypt challenge value using NTRU and send it to the client
async function encryptChallenge() {
  try {
    const encryptedChallengeValue = await ntru.encrypt(
      challengeValue,
      ntruPublicKey
    );
    return encryptedChallengeValue;
  } catch (error) {
    console.error("Error encrypting challenge value:", error);
    return null;
  }
}

// Encrypt the challenge on server startup
let encryptedChallengeValue;
encryptChallenge().then((encValue) => {
  if (encValue) {
    encryptedChallengeValue = encValue;
    const base64Challenge = uint8ArrayToBase64String(encryptedChallengeValue);
    // console.log("Base64 Encoded Challenge:", base64Challenge); // Log it for debugging
  }
});

// Routes

// Home route (to render HTML)
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Route to send the encrypted challenge value to the client
app.get("/authenticate", (req, res) => {
  if (encryptedChallengeValue) {
    const base64Challenge = uint8ArrayToBase64String(encryptedChallengeValue);
    res.json({ encryptedChallenge: base64Challenge });
  } else {
    res.status(500).json({ message: "Error encrypting challenge value" });
  }
});

// Route to handle the challenge response and authenticate the user
app.post("/challenge", async (req, res) => {
  const { challengeResponseBase64, signatureBase64 } = req.body; // Assuming challenge response is in the body

  if (!challengeResponseBase64) {
    return res.status(400).json({ message: "Challenge response missing" });
  }
  if (!signatureBase64) {
    return res.status(400).json({ message: "Signature missing" });
  }

  try {
    const receivedValue = base64StringToUint8Array(challengeResponseBase64);
    const signature = base64StringToUint8Array(signatureBase64);
    const isValid = await dilithium.verifyDetached(signature, receivedValue, dilithiumPublicKey);

    // Verify the signature and compare the received value with the original challenge value
    if (isValid && (JSON.stringify(receivedValue) === JSON.stringify(challengeValue))) {
      return res.json({ status: "success", authenticated: true });
    } else {
      return res.json({ status: "failure", authenticated: false });
    }
  } catch (error) {
    console.error("Error processing challenge:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
