const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Allow frontend + admin
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://yourfrontenddomain.com",
      "https://youradmindomain.com",
    ],
  })
);

app.use(express.json());

// Neon DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


// ==========================
// GET ALL BLOGS
// ==========================
app.get("/blogs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blogs ORDER BY date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================
// GET SINGLE BLOG
// ==========================
app.get("/blogs/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blogs WHERE id=$1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================
// ADD BLOG
// ==========================
app.post("/blogs", async (req, res) => {
  try {
    const {
      title,
      slug,
      short_description,
      content,
      author_name,
      category,
      status,
      image_url,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO blogs 
      (title, slug, short_description, content, author_name, category, status, image_url, date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      RETURNING *`,
      [
        title,
        slug,
        short_description,
        content,
        author_name,
        category,
        status,
        image_url,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================
// UPDATE BLOG
// ==========================
app.put("/blogs/:id", async (req, res) => {
  try {
    const {
      title,
      slug,
      short_description,
      content,
      author_name,
      category,
      status,
      image_url,
    } = req.body;

    const result = await pool.query(
      `UPDATE blogs SET
      title=$1,
      slug=$2,
      short_description=$3,
      content=$4,
      author_name=$5,
      category=$6,
      status=$7,
      image_url=$8
      WHERE id=$9
      RETURNING *`,
      [
        title,
        slug,
        short_description,
        content,
        author_name,
        category,
        status,
        image_url,
        req.params.id,
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================
// DELETE BLOG
// ==========================
app.delete("/blogs/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM blogs WHERE id=$1", [
      req.params.id,
    ]);

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
