const fs = require('fs');
const ntru = require('ntru-legacy');

// Function to generate the key pair and save them into files
async function generateKeys() {
    try {
        // Generate a key pair (public and private keys)
        const keyPair = await ntru.keyPair();
        
        // Save the public and private keys to files
        fs.writeFileSync('public_key.txt', Buffer.from(keyPair.publicKey).toString("base64"));
        fs.writeFileSync('private_key.txt', Buffer.from(keyPair.privateKey).toString("base64"));

        console.log('Public and private keys generated and saved successfully.');
    } catch (error) {
        console.error('Error generating keys:', error);
    }
}

// Call the function to generate and save the keys
generateKeys();
