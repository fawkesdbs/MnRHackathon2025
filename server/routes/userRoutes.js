const express = require('express');
const { poolPromise, sql } = require("../db");
const router = express.Router();
const bcrypt = require("bcrypt");
const authenticateToken = require("../middleware/authToken"); // We'll create this middleware

// // GET all users
// router.get("/", async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query("SELECT * FROM users");
//     res.json(result.recordset);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// // GET a single user by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .input("id", sql.Int, req.params.id)
//       .query("SELECT * FROM users WHERE id = @id");
//     res.json(result.recordset[0]);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// // CREATE a new user (assuming you still need this alongside auth)
// router.post("/", async (req, res) => {
//   try {
//     const { name, email, password_hash } = req.body;
//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .input("name", sql.VarChar, name)
//       .input("email", sql.VarChar, email)
//       .input("password_hash", sql.VarChar, password_hash)
//       .query(
//         "INSERT INTO users (name, email, password_hash) VALUES (@name, @email, @password_hash); SELECT SCOPE_IDENTITY() AS id;"
//       );
//     res.status(201).json({ id: result.recordset[0].id, ...req.body });
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// // UPDATE a user's preferences
// router.put("/:id/preferences", async (req, res) => {
//   try {
//     const { notify_on_risk_change, min_alert_level } = req.body;
//     const pool = await poolPromise;
//     await pool
//       .request()
//       .input("id", sql.Int, req.params.id)
//       .input("notify", sql.Bit, notify_on_risk_change)
//       .input("level", sql.VarChar, min_alert_level)
//       .query(
//         "UPDATE users SET notify_on_risk_change = @notify, min_alert_level = @level WHERE id = @id"
//       );
//     res.status(200).json({ message: "Preferences updated" });
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// module.exports = router;

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("id", sql.Int, req.user.id)
      .query(`
        SELECT u.id, u.email, COALESCE(up.full_name, u.name) AS full_name, up.email_notifications, up.risk_threshold 
        FROM dbo.users u
        LEFT JOIN dbo.user_profiles up ON u.id = up.user_id
        WHERE u.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).send(err.message);
  }
});

// --- CORRECTED: Update the user's profile ---
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const {
      full_name,
      email_notifications,
      risk_threshold,
      currentPassword,
      newPassword,
    } = req.body;
    const userId = req.user.id;
    const pool = await poolPromise;

    const riskThresholdMap = { Medium: 1, High: 2, Critical: 3 };
    const riskThresholdInt = riskThresholdMap[risk_threshold] || 1; // Default to 1 (Medium)

    // --- Part 1: Update the user_profiles table ---
    // This MERGE statement now correctly only updates the updatedAt field in the user_profiles table.
    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("full_name", sql.NVarChar, full_name)
      .input("email_notifications", sql.Bit, email_notifications)
      .input("risk_threshold", sql.Int, riskThresholdInt).query(`
                MERGE dbo.user_profiles AS target
                USING (SELECT @user_id AS user_id) AS source
                ON (target.user_id = source.user_id)
                WHEN MATCHED THEN
                    UPDATE SET 
                        full_name = @full_name, 
                        email_notifications = @email_notifications, 
                        risk_threshold = @risk_threshold,
                        updated_at = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (user_id, full_name, email_notifications, risk_threshold)
                    VALUES (@user_id, @full_name, @email_notifications, @risk_threshold);
            `);

    // --- Part 2: Optionally update password in the users table ---
    if (newPassword && currentPassword) {
      const result = await pool
        .request()
        .input("id", sql.Int, userId)
        .query("SELECT password FROM dbo.users WHERE id = @id");

      const user = result.recordset[0];

      if (!user || !user.password) {
        return res
          .status(400)
          .json({ message: "Cannot update password for social login users." });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password." });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool
        .request()
        .input("id", sql.Int, userId)
        .input("password", sql.NVarChar, hashedNewPassword)
        .query("UPDATE dbo.users SET password = @password WHERE id = @id");
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;