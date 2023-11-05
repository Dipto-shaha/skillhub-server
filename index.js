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
    const bidCollection = client.db("skillhub").collection("bid");



    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/job',async(req,res)=>{
        const result = await Collection.find().toArray();
        res.send(result);
    })
    app.get('/userjob',async(req,res)=>{
        const {email}= req.query;
        const result = await Collection.find({email}).toArray();
        res.send(result);
    })
    app.get('/job/:id',async(req,res)=>{
        const id = req.params.id;
        const result = await Collection.findOne({ _id: new ObjectId(id) });
        return res.send(result);
    })
    app.post('/addjob',async(req,res)=>{
        const job=req.body;
        const result = await Collection.insertOne(job);
        res.send(result);
    });
    app.post('/bidjob',async(req,res)=>{
        const job=req.body;
        const result = await bidCollection.insertOne(job);
        res.send(result);
    });
    app.put("/updatejob/:_id", async (req, res) => {
        const id = req.params._id;
        console.log("Update Job ",id);
        const job = req.body;
        console.log(id);
        const result = await Collection.updateOne(
          { _id: new ObjectId(id) }, // Find Data by query many time query type is "_id: id" Cheack on database
          {
            $set: job, // Set updated Data
          },
          { upsert: true } // define work
        );
        res.send({ result });
      });
    app.delete("/jobDelete/:_id", async (req, res) => {
        const id = req.params._id;
        console.log("Job delted",id);
        const result = await Collection.deleteOne({_id: new ObjectId(id) });
        res.send(result);
    });

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


