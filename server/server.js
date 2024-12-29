const express = require("express");
const cors = require("cors");
const fs = require("fs");
const ntru = require("ntru-legacy");
const bodyParser = require("body-parser");

// Initialize the app
const app = express();

// Use CORS middleware (optional)
app.use(cors());

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Define a challenge value (this is the original value to compare against)
const challengeValue = new Uint8Array([1, 2, 3]);

// Load the public key for encryption
let publicKey;
try {
  const publicKeyBase64 = fs.readFileSync("./keys/public_key.txt");
  publicKey = new Uint8Array(atob(publicKeyBase64).split('').map(char => char.charCodeAt(0)));
} catch (error) {
  console.error("Error loading public key:", error);
}

// Encrypt challenge value using NTRU and send it to the client
async function encryptChallenge() {
  try {
    const encryptedChallengeValue = await ntru.encrypt(
      challengeValue,
      publicKey
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
    // Ensure base64 encoding is correct
    const base64Challenge = Buffer.from(encryptedChallengeValue).toString("base64");
    console.log("Base64 Encoded Challenge:", base64Challenge); // Log it for debugging
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
    const base64Challenge = Buffer.from(encryptedChallengeValue).toString("base64");
    // console.log("encryptedChallengeValue:", base64Challenge)
    res.json({ encryptedChallenge: base64Challenge });
  } else {
    res.status(500).json({ message: "Error encrypting challenge value" });
  }
});

// Route to handle the challenge response and authenticate the user
app.post("/challenge", async (req, res) => {
  const { challengeResponse } = req.body; // Assuming challenge response is in the body

  if (!challengeResponse) {
    return res.status(400).json({ message: "Challenge response missing" });
  }

  try {
    // Convert base64 string to a Uint8Array for decryption
    const responseBuffer = new Uint8Array(Buffer.from(challengeResponse, "base64"));


    // Decrypt the challenge response using the public key (as per NTRU)
    // const decryptedResponse = await ntru.decrypt(responseBuffer, publicKey);

    // Compare the decrypted challenge response with the original challenge value
    // if (JSON.stringify(decryptedResponse) === JSON.stringify(challengeValue)) {
    if (JSON.stringify(responseBuffer) === JSON.stringify(challengeValue)) {
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
