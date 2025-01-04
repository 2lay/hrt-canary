const openpgp = require('openpgp');
const fetch = require('node-fetch');
require('dotenv').config();

const PUBLIC_KEY_URL = process.env.PUBLIC_KEY_URL;
let publicKey = null;

async function loadPublicKey() {
    try {
        const response = await fetch(PUBLIC_KEY_URL);
        const keyText = await response.text();
        publicKey = await openpgp.readKey({ armoredKey: keyText });
        return publicKey;
    } catch (error) {
        console.error('Failed to load public key:', error);
        throw error;
    }
}

async function verifySignature(signedMessage) {
    if (!publicKey) {
        await loadPublicKey();
    }

    try {
        const message = await openpgp.readCleartextMessage({
            cleartextMessage: signedMessage
        });

        const verificationResult = await openpgp.verify({
            message,
            verificationKeys: publicKey
        });

        const { verified, keyID } = verificationResult.signatures[0];
        await verified;

        // extract date from the message
        const dateMatch = signedMessage.match(/(\d{4}-\d{2}-\d{2})/);
        const canaryDate = dateMatch ? dateMatch[1] : null;

        return {
            isValid: true,
            keyID: keyID.toHex().toUpperCase(),
            date: canaryDate
        };
    } catch (error) {
        return {
            isValid: false,
            error: error.message
        };
    }
}

module.exports = {
    verifySignature
};
