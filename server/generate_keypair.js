const fs = require('fs');
const ntru = require('ntru-legacy');
const dilithium = require('dilithium-crystals');

// Function to generate the key pair and save them into files
async function generateKeys() {
    try {
        const ntruKeyPair = await ntru.keyPair();
        const dilithiumKeyPair = await dilithium.keyPair();
        
        fs.writeFileSync('ntru_public_key.txt', Buffer.from(ntruKeyPair.publicKey).toString("base64"));
        fs.writeFileSync('ntru_private_key.txt', Buffer.from(ntruKeyPair.privateKey).toString("base64"));

        fs.writeFileSync('dilithium_public_key.txt', Buffer.from(dilithiumKeyPair.publicKey).toString("base64"));
        fs.writeFileSync('dilithium_private_key.txt', Buffer.from(dilithiumKeyPair.privateKey).toString("base64"));

        console.log('Public and private keys generated and saved successfully.');
    } catch (error) {
        console.error('Error generating keys:', error);
    }
}

generateKeys();
