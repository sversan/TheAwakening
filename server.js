const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware pentru a parsa datele JSON trimise din browser
app.use(express.json());

// 1. Servim fișierele din folderul 'public' (index.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 2. Servim EXPLICIT folderul 'outputs' pentru a putea vedea videoclipurile
app.use('/outputs', express.static(path.join(__dirname, 'public/outputs')));

// Ruta principală pentru generare
app.post('/generate-video', (req, res) => {
    const { autor, titlu, mesaj } = req.body;

    if (!autor || !titlu || !mesaj) {
        return res.status(400).json({ error: 'Toate campurile sunt obligatorii!' });
    }

    console.log(`[SERVER] Cerere primita pentru autor: ${autor}`);

    // Apelăm executabilul C++ (./gen)
    // IMPORTANT: Nu punem extensia .jpg aici, o pune codul C++
    const command = `./gen "${autor}" "${titlu}" "${mesaj}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[EROARE C++] ${error.message}`);
            return res.status(500).json({ error: 'Eroare la generarea video-ului', details: stderr });
        }

        console.log(`[C++ STDOUT] ${stdout}`);
        
        // Trimitem calea corectă către fișierul generat
        const videoFileName = `output_${autor}.mp4`;
        res.json({ 
            success: true, 
            videoPath: `/outputs/${videoFileName}` 
        });
    });
});

// Pornire server
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 MAITREJI Server ruleaza la: http://localhost:${PORT}`);
    console.log(`📂 Folder outputs: ${path.join(__dirname, 'public/outputs')}`);
    console.log('-------------------------------------------');
});


