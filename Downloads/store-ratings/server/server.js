const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Add error handling to the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Authentication required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden" })
    }
    next()
  }
}

// Routes

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, address, password } = req.body

    // Validate input
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 20 and 60 characters" })
    }

    if (address.length > 400) {
      return res.status(400).json({ message: "Address must be less than 400 characters" })
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase letter and one special character",
      })
    }

    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role",
      [name, email, address, hashedPassword, "user"],
    )

    const user = result.rows[0]

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const user = result.rows[0]

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({ token, user: userWithoutPassword })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, address, role FROM users WHERE id = $1", [req.user.id])
    console.log(result);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validate new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase letter and one special character",
      })
    }

    // Get current user
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = userResult.rows[0]

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.user.id])

    res.json({ message: "Password updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin routes
app.get("/api/admin/stats", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const usersResult = await pool.query("SELECT COUNT(*) FROM users")
    const storesResult = await pool.query("SELECT COUNT(*) FROM stores")
    const ratingsResult = await pool.query("SELECT COUNT(*) FROM ratings")

    console.log("Users Count:", usersResult.rows[0]?.count);
    console.log("Stores Count:", storesResult.rows[0]?.count);
    console.log("Ratings Count:", ratingsResult.rows[0]?.count);

    res.json({
      totalUsers: Number.parseInt(usersResult.rows[0].count),
      totalStores: Number.parseInt(storesResult.rows[0].count),
      totalRatings: Number.parseInt(ratingsResult.rows[0].count),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/admin/stores", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address } = req.query

    let query = `
      SELECT s.*, 
        (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as rating
      FROM stores s
      WHERE 1=1
    `

    const params = []
    let paramIndex = 1

    if (name) {
      query += ` AND s.name ILIKE $${paramIndex}`
      params.push(`%${name}%`)
      paramIndex++
    }

    if (email) {
      query += ` AND s.email ILIKE $${paramIndex}`
      params.push(`%${email}%`)
      paramIndex++
    }

    if (address) {
      query += ` AND s.address ILIKE $${paramIndex}`
      params.push(`%${address}%`)
      paramIndex++
    }

    query += " ORDER BY s.name ASC"

    const result = await pool.query(query, params)
    console.log(result.rows);

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/admin/stores", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address } = req.body

    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM stores WHERE email = $1", [email])
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Insert new store
    const result = await pool.query("INSERT INTO stores (name, email, address) VALUES ($1, $2, $3) RETURNING *", [
      name,
      email,
      address,
    ])

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/admin/users", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address, role } = req.query

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role,
        CASE WHEN u.role = 'store_owner' THEN
          (SELECT AVG(r.rating) FROM stores s
           LEFT JOIN ratings r ON s.id = r.store_id
           WHERE s.owner_id = u.id)
        ELSE NULL END as store_rating
      FROM users u
      WHERE 1=1
    `

    const params = []
    let paramIndex = 1

    if (name) {
      query += ` AND u.name ILIKE $${paramIndex}`
      params.push(`%${name}%`)
      paramIndex++
    }

    if (email) {
      query += ` AND u.email ILIKE $${paramIndex}`
      params.push(`%${email}%`)
      paramIndex++
    }

    if (address) {
      query += ` AND u.address ILIKE $${paramIndex}`
      params.push(`%${address}%`)
      paramIndex++
    }

    if (role) {
      query += ` AND u.role = $${paramIndex}`
      params.push(role)
      paramIndex++
    }

    query += " ORDER BY u.name ASC"

    const result = await pool.query(query, params)
    console.log("Fetched Users:", result.rows);

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/admin/users", authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body

    // Validate input
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 20 and 60 characters" })
    }

    if (address.length > 400) {
      return res.status(400).json({ message: "Address must be less than 400 characters" })
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters with at least one uppercase letter and one special character",
      })
    }

    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role",
      [name, email, address, hashedPassword, role],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// User routes
app.get("/api/user/stores", authenticateToken, async (req, res) => {
  try {
    const { name, address } = req.query

    let query = `
      SELECT s.*, 
        (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as rating,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) as user_rating
      FROM stores s
      WHERE 1=1
    `

    const params = [req.user.id]
    let paramIndex = 2

    if (name) {
      query += ` AND s.name ILIKE $${paramIndex}`
      params.push(`%${name}%`)
      paramIndex++
    }

    if (address) {
      query += ` AND s.address ILIKE $${paramIndex}`
      params.push(`%${address}%`)
      paramIndex++
    }

    query += " ORDER BY s.name ASC"

    const result = await pool.query(query, params)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})
app.post("/api/user/stores/:id/rate", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if store exists
    const storeCheck = await pool.query("SELECT * FROM stores WHERE id = $1", [id]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Upsert rating
    await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET rating = $3, updated_at = NOW()
    `, [req.user.id, id, rating]);

    // Get updated store data with averages
    const updatedStore = await pool.query(`
      SELECT 
        s.*,
        (SELECT AVG(rating) FROM ratings WHERE store_id = $1) as rating,
        (SELECT rating FROM ratings WHERE store_id = $1 AND user_id = $2) as user_rating
      FROM stores s
      WHERE s.id = $1
    `, [id, req.user.id]);

    if (updatedStore.rows.length === 0) {
      return res.status(404).json({ message: "Store not found after update" });
    }

    res.json({
      message: "Rating submitted successfully",
      store: updatedStore.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Store Owner routes
app.get("/api/store-owner/dashboard", authenticateToken, authorize(['store_owner']), async (req, res) => {
  try {
    // Get store information
    const storeResult = await pool.query("SELECT * FROM stores WHERE owner_id = $1", [req.user.id])

    if (storeResult.rows.length === 0) {
      return res.json({
        store: null,
        ratings: [],
        averageRating: 0,
      })
    }

    const store = storeResult.rows[0]

    // Get ratings for the store
    const ratingsResult = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email 
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id],
    )

    // Calculate average rating
    const avgRatingResult = await pool.query("SELECT AVG(rating) FROM ratings WHERE store_id = $1", [store.id])

    const averageRating = avgRatingResult.rows[0].avg || 0

    // Format ratings for response
    const formattedRatings = ratingsResult.rows.map((row) => ({
      id: row.id,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      ratedAt: row.created_at,
    }))

    res.json({
      store,
      ratings: formattedRatings,
      averageRating,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Database initialization
const initDb = async () => {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        store_id INTEGER REFERENCES stores(id) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )
    `)

    // Check if admin user exists, if not create one
    const adminCheck = await pool.query("SELECT * FROM users WHERE role = 'admin'")

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10)
      await pool.query("INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5)", [
        "Administrator Account Name",
        "admin@example.com",
        "123 Admin Street, Admin City",
        hashedPassword,
        "admin",
      ])
      console.log("Admin user created")
    }

    console.log("Database initialized")
  } catch (err) {
    console.error("Error initializing database:", err)
    process.exit(1)
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await initDb()
})
