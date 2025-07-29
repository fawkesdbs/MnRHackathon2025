const { poolPromise, sql } = require('../db');

// List all diagnostic tests
const list = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM DiagnosticTests'); // Assumes table name is DiagnosticTests
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Create a new diagnostic test
const create = async (req, res) => {
    try {
        const { name, result, date } = req.body;
        const pool = await poolPromise;
        const dbResult = await pool.request()
            .input('name', sql.VarChar, name)
            .input('result', sql.VarChar, result) // Assuming result is text, adjust if not
            .input('date', sql.DateTime, date) // Assuming date is sent in a compatible format
            .query('INSERT INTO DiagnosticTests (name, result, date) VALUES (@name, @result, @date); SELECT SCOPE_IDENTITY() AS id;');
        res.status(201).json({ id: dbResult.recordset[0].id, ...req.body });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Update a diagnostic test
const update = async (req, res) => {
    try {
        const { name, result, date } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.VarChar, name)
            .input('result', sql.VarChar, result)
            .input('date', sql.DateTime, date)
            .query('UPDATE DiagnosticTests SET name = @name, result = @result, date = @date WHERE id = @id');
        res.status(200).json({ message: 'Diagnostic test updated successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Delete a diagnostic test
const del = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM DiagnosticTests WHERE id = @id');
        res.status(200).json({ message: 'Diagnostic test deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    list,
    create,
    update,
    del
};