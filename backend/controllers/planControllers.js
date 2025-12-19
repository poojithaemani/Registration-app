import { pool } from "../db.js";

/* ================= PAYMENT PLAN ================= */

// GET all payment plans
export const getPaymentPlans = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM paymentplan ORDER BY paymentplanid"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE payment plan
export const updatePaymentPlan = async (req, res) => {
  const { paymentplanid } = req.params;
  const { plantype, planduration } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE paymentplan
      SET plantype = $1,
          planduration = $2
      WHERE paymentplanid = $3
      RETURNING *
      `,
      [plantype, planduration, paymentplanid]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= PROGRAMS ================= */

// GET all programs
export const getPrograms = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM programs ORDER BY programid"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE program
export const updateProgram = async (req, res) => {
  const { programid } = req.params;
  const { programname } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE programs
      SET programname = $1
      WHERE programid = $2
      RETURNING *
      `,
      [programname, programid]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= ROOM TYPES ================= */

// GET all room types
export const getRoomTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM roomtypes ORDER BY roomtypeid"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE room type
export const updateRoomType = async (req, res) => {
  const { roomtypeid } = req.params;
  const { roomtype } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE roomtypes
      SET roomtype = $1
      WHERE roomtypeid = $2
      RETURNING *
      `,
      [roomtype, roomtypeid]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
