const express = require('express');
const { poolPromise, sql } = require("../db");
const router = express.Router();
const bcrypt = require("bcrypt");
const authenticateToken = require("../middleware/authToken");

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("id", sql.Int, req.user.id)
      .query(`
        SELECT u.id, u.email, COALESCE(up.full_name, u.name + ' ' + u.surname) AS full_name, up.email_notifications, up.risk_threshold 
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
    const riskThresholdInt = riskThresholdMap[risk_threshold] || 1;

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

router.delete("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      await request
        .input("userIdForDestLink", sql.Int, userId)
        .query(
          "DELETE FROM dbo.user_destinations WHERE user_id = @userIdForDestLink"
        );

      await request
        .input("userIdForProfile", sql.Int, userId)
        .query(
          "DELETE FROM dbo.user_profiles WHERE user_id = @userIdForProfile"
        );

      await request
        .input("userIdForSession", sql.Int, userId)
        .query("DELETE FROM dbo.sessions WHERE user_id = @userIdForSession");

      await request
        .input("userIdForUser", sql.Int, userId)
        .query("DELETE FROM dbo.users WHERE id = @userIdForUser");

      await transaction.commit();
      res.status(200).json({ message: "User profile deleted successfully." });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;