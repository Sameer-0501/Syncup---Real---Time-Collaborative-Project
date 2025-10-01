// backend/routes/boards.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

/* GET /api/boards - list boards */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM boards ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching boards:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET /api/boards/:id - board + its lists + cards */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const boardQ = await pool.query("SELECT * FROM boards WHERE id=$1", [id]);
    if (boardQ.rows.length === 0) return res.status(404).json({ error: "Board not found" });
    const board = boardQ.rows[0];

    const listsQ = await pool.query("SELECT * FROM lists WHERE board_id=$1 ORDER BY position", [id]);
    const lists = listsQ.rows;

    // fetch cards for each list
    for (let list of lists) {
      const cardsQ = await pool.query("SELECT * FROM cards WHERE list_id=$1 ORDER BY position, id", [list.id]);
      list.cards = cardsQ.rows;
    }

    board.lists = lists;
    res.json(board);
  } catch (err) {
    console.error("Error fetching board details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* POST /api/boards - create new board */
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query("INSERT INTO boards (name) VALUES ($1) RETURNING *", [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating board:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
