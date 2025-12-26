
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Σερβίρισμα των στατικών αρχείων της εφαρμογής
app.use(express.static(__dirname));

// Ρυθμίσεις HTTPS (Πρέπει να δημιουργήσετε τα αρχεία cert.pem και key.pem)
try {
    const options = {
        key: fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
    };

    https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
        console.log(`-----------------------------------------------`);
        console.log(`ASPIS Bins Server is running on:`);
        console.log(`https://localhost:${PORT}`);
        console.log(`https://[Η-ΤΟΠΙΚΗ-ΣΑΣ-IP]:${PORT}`);
        console.log(`-----------------------------------------------`);
        console.log(`ΟΔΗΓΙΕΣ:`);
        console.log(`1. Βεβαιωθείτε ότι το κινητό είναι στο ίδιο WiFi.`);
        console.log(`2. Ανοίξτε την https διεύθυνση στον browser του κινητού.`);
        console.log(`-----------------------------------------------`);
    });
} catch (error) {
    console.error("ΣΦΑΛΜΑ: Δεν βρέθηκαν τα αρχεία key.pem και cert.pem.");
    console.log("Παρακαλώ δημιουργήστε τα χρησιμοποιώντας το εργαλείο mkcert.");
}
