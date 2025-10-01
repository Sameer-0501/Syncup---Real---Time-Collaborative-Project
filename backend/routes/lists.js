// backend/routes/lists.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET lists for a board
router.get("/board/:boardId", async (req, res) => {
  const { boardId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM lists WHERE board_id=$1 ORDER BY position", [boardId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching lists:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create list in board
router.post("/board/:boardId", async (req, res) => {
  const { boardId } = req.params;
  const { name, position } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO lists (name, board_id, position) VALUES ($1, $2, $3) RETURNING *",
      [name, boardId, position ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating list:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
