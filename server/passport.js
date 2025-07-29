const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { sql, poolPromise } = require("./db.js"); // Adjust the path to your db.js file
const dotenv = require("dotenv");

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.name.givenName;
        const surname = profile.name.familyName;

        const pool = await poolPromise;

        // Check if user exists
        const existingResult = await pool
          .request()
          .input("email", sql.NVarChar, email)
          .query("SELECT * FROM dbo.users WHERE email = @email");

        let user;

        if (existingResult.recordset.length === 0) {
          // Insert new user
          const insertResult = await pool
            .request()
            .input("name", sql.NVarChar, name)
            .input("surname", sql.NVarChar, surname)
            .input("email", sql.NVarChar, email)
            .input("google_id", sql.NVarChar, googleId).query(`
              INSERT INTO dbo.users (name, surname, email, google_id) 
              OUTPUT INSERTED.*
              VALUES (@name, @surname, @email, @google_id)
            `);

          user = insertResult.recordset[0];
        } else {
          user = existingResult.recordset[0];
        }

        return done(null, user);
      } catch (err) {
        console.error("Passport Google Strategy error:", err);
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM dbo.users WHERE id = @id");

    const user = result.recordset[0];
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
