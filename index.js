const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config()

const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const port= process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.bnmqd0w.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    const Collection = client.db("skillhub").collection("job");


    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/job',async(req,res)=>{
        const result = await Collection.find().toArray();
        res.send(result);
    })
  

    app.get("/check",(req,res)=>{
      res.send("Welcome to Database");
    })
    
  
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Welcom to Backend');
})

app.listen(port, () => {
    console.log('Server is running on ',port);
})

