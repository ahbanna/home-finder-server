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
      // Check existing user end
      const result = await userCollection.insertOne({
        fullName,
        role,
        phoneNumber,
        email,
        password,
      });
      res.send(result);
    });
    // Create users end

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

// new start
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await client
//       .db(process.env.DB_NAME)
//       .collection("users")
//       .findOne({ email });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     res.status(200).json({ message: "Login successful" });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// new end

app.get("/", (req, res) => {
  res.send("Home finder server is running");
});
app.listen(port, () => {
  console.log(`Home finder server is running on port:${port}`);
});

// homeFinder
// oj6uY8sYnl1OTJ0U
