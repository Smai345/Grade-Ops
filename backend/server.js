const express = require('express');
const multer = require('multer');
const pool = require('./db');

const app = express();
app.use(express.json());

// Setup Multer to save files to an 'uploads' directory
const upload = multer({ dest: 'uploads/' });

// Health check to ensure PostgreSQL is connected
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'DB Connected', time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ error: 'DB Connection Failed', details: err.message });
    }
});

// Endpoint to handle the exam PDF upload
app.post('/api/upload', upload.single('exam_pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // At this stage, the file is saved locally in the 'uploads' folder
    res.json({
        message: 'File successfully received',
        filePath: req.file.path
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`GradeOps Backend running on http://localhost:${PORT}`);
});