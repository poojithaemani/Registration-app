import { pool } from "../db.js";
import { comparePassword } from "../utils/passwordUtils.js";

/**
 * Login user with email and password validation
 * Checks user existence and validates credentials
 * @param {Object} req - Express request object with email and password in body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error message
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Query user from database
    const userQuery = `
      SELECT u.userid, u.email, u.password, u.roleid
      FROM users u
      WHERE u.email = $1
    `;

    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Return user data without password
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        userid: user.userid,
        email: user.email,
        roleid: user.roleid,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * Get all users (for testing/debugging - remove in production)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.userid, u.email, u.roleid
      FROM users u
      ORDER BY u.userid
    `;

    const result = await pool.query(query);
    res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};
