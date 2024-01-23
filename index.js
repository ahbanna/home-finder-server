const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcrypt");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7baavr.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // collections starts
    const userCollection = client.db("homeFinder").collection("users");
    const houseCollection = client.db("homeFinder").collection("allhouses");
    // collections end

    // Create users starts
    app.post("/register", async (req, res) => {
      console.log("post API hitting");
      const { fullName, role, phoneNumber, email, password } = req.body;
      console.log(fullName, role, phoneNumber, email, password);
      // Check existing user starts
      const query = { email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.status(400).json({ message: "This user already exists." });
      }

      // Log hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed Password:", hashedPassword);
      // Check existing user end
      const result = await userCollection.insertOne({
        fullName,
        role,
        phoneNumber,
        email,
        password: hashedPassword,
      });
      res.send(result);
    });
    // Create users end

    // Login starts
    app.post("/login", async (req, res) => {
      console.log("login API hitting");
      const { email, password } = req.body;

      console.log("Received email and password:", email, password);

      // Check if the user exists
      const user = await userCollection.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate a JWT token for authentication
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h", // You can adjust the expiration time as needed
        }
      );

      // Return the token to the client
      res.json({ token });
    });
    // Login end

    // house CREATE api to receive data from client side starts
    app.post("/allhouses", async (req, res) => {
      const newHouse = req.body;
      console.log(newHouse);
      // insert or add data to the mongodb database
      const result = await houseCollection.insertOne(newHouse);
      // send result to the client
      res.send(result);
    });
    // house CREATE api to receive data from client side end

    // house READ starts
    app.get("/allhouses", async (req, res) => {
      const cursor = houseCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // house READ end

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Home finder server is running");
});
app.listen(port, () => {
  console.log(`Home finder server is running on port:${port}`);
});

// homeFinder
// oj6uY8sYnl1OTJ0U
