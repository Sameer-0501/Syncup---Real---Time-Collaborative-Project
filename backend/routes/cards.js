// backend/routes/cards.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get cards by list
router.get('/list/:listId', async (req, res) => {
  const { listId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cards WHERE list_id = $1 ORDER BY position, id', [listId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create card in a list
router.post('/list/:listId', async (req, res) => {
  const { listId } = req.params;
  const { title, description, position } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cards (title, description, list_id, position) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description ?? null, listId, position ?? 0]
    );
    const card = result.rows[0];
    if (req.app.get('io')) req.app.get('io').emit('cardCreated', card);
    res.status(201).json(card);
  } catch (err) {
    console.error('Error creating card:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update card (move or edit)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, list_id, position } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cards SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         list_id = COALESCE($3, list_id),
         position = COALESCE($4, position),
         updated_at = now()
       WHERE id = $5 RETURNING *`,
      [title, description, list_id, position, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Card not found' });
    const card = result.rows[0];
    if (req.app.get('io')) req.app.get('io').emit('cardUpdated', card);
    res.json(card);
  } catch (err) {
    console.error('Error updating card:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete card
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pre = await pool.query('SELECT * FROM cards WHERE id=$1', [id]);
    if (pre.rows.length === 0) return res.status(404).json({ error: 'Card not found' });
    await pool.query('DELETE FROM cards WHERE id=$1', [id]);
    if (req.app.get('io')) req.app.get('io').emit('cardDeleted', { cardId: id, listId: pre.rows[0].list_id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting card:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
