require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup ---
const db = new sqlite3.Database('./quiz.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      name TEXT,
      email TEXT,
      q1 TEXT,
      q2 TEXT,
      q3 TEXT,
      q4 TEXT,
      q5 TEXT,
      q6 TEXT,
      q7 TEXT,
      q8 TEXT,
      q9 TEXT,
      q10 TEXT,
      q11 TEXT,
      q12 TEXT,
      q13 TEXT,
      q14 TEXT,
      q15 TEXT,
      q16 TEXT
    );
  `);
});

// --- Middlewares ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Handle form submit
app.post('/submit', (req, res) => {
  const {
    name,
    email,
    q1, q2, q3, q4, q5,
    q6, q7, q8, q9, q10,
    q11, q12, q13, q14, q15,q16
  } = req.body;

  const sql = `
    INSERT INTO responses (
      name, email,
      q1, q2, q3, q4, q5,
      q6, q7, q8, q9, q10,
      q11, q12, q13, q14, q15,q16
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const params = [
    name || null,
    email || null,
    q1, q2, q3, q4, q5,
    q6, q7, q8, q9, q10,
    q11, q12, q13, q14, q15, q16
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error inserting response:', err);
      return res.status(500).send('Something went wrong. Please try again.');
    }
    const insertedId = this.lastID;
    // redirect with id so they can download their own result
    res.redirect(`/thanks.html?id=${insertedId}`);
  });
});

// Get ALL responses (JSON)
app.get('/api/responses', (req, res) => {
  db.all('SELECT * FROM responses ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching responses:', err);
      return res.status(500).json({ error: 'Failed to fetch responses' });
    }
    res.json(rows);
  });
});

// Get single response (JSON)
app.get('/api/responses/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM responses WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching response:', err);
      return res.status(500).json({ error: 'Failed to fetch response' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json(row);
  });
});

// --- CSV helpers ---
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Export all as CSV
app.get('/export/csv', (req, res) => {
  db.all('SELECT * FROM responses ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error exporting CSV:', err);
      return res.status(500).send('Failed to export CSV');
    }

    const header = [
      'id',
      'created_at',
      'name',
      'email',
      'q1','q2','q3','q4','q5',
      'q6','q7','q8','q9','q10',
      'q11','q12','q13','q14','q15','q16'
    ];

    const lines = [];
    lines.push(header.join(','));

    rows.forEach(r => {
      const row = [
        r.id,
        r.created_at,
        r.name,
        r.email,
        r.q1, r.q2, r.q3, r.q4, r.q5,
        r.q6, r.q7, r.q8, r.q9, r.q10,
        r.q11, r.q12, r.q13, r.q14, r.q15, r.q16
      ].map(escapeCSV);

      lines.push(row.join(','));
    });

    const csv = lines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pvs_responses.csv"');
    res.send(csv);
  });
});

// Export one as CSV
app.get('/export/csv/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM responses WHERE id = ?', [id], (err, r) => {
    if (err) {
      console.error('Error exporting single CSV:', err);
      return res.status(500).send('Failed to export CSV');
    }
    if (!r) {
      return res.status(404).send('Response not found');
    }

    const header = [
      'id',
      'created_at',
      'name',
      'email',
      'q1','q2','q3','q4','q5',
      'q6','q7','q8','q9','q10',
      'q11','q12','q13','q14','q15','q16'
    ];

    const row = [
      r.id,
      r.created_at,
      r.name,
      r.email,
      r.q1, r.q2, r.q3, r.q4, r.q5,
      r.q6, r.q7, r.q8, r.q9, r.q10,
      r.q11, r.q12, r.q13, r.q14, r.q15, r.q16
    ].map(escapeCSV);

    const csv = header.join(',') + '\n' + row.join(',');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="pvs_response_${id}.csv"`);
    res.send(csv);
  });
});

// Root -> index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
