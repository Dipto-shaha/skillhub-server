const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const port= process.env.PORT || 5000;

app.use(cors({origin:['http://localhost:5173','https://skillhub-d14ce.web.app'], credentials : true}));
app.use(express.json());
app.use(cookieParser());

const verifyToken =async(req,res,next) =>{
  const token =req.cookies?.token;
  if(!token)
      return res.send({message: "Unauthorized Access"})
      console.log("My token is ",token);
      jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
        if(err)
        {
          return res.send({message: "Unauthorized Access"})
        }
        req.user=decoded;
        next();
    })
}

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
    app.post('/jwt',async(req,res)=>{
      const result=req.body;
      console.log("Token Created");
      const token= jwt.sign(result,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
      res.cookie('token', token ,{
        httpOnly:true,
        secure: process.env.NODE_ENV ==='production',
        sameSite:  process.env.NODE_ENV ==='production' ? 'none': 'strict'
      })
      .send({success:true});
    })
    app.post('/logout', async (req, res) => {
      const user = req.body;
      console.log('logging out');
      res
      .clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true })
      .send({ success: true })
    })
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    const Collection = client.db("skillhub").collection("job");
    const bidCollection = client.db("skillhub").collection("bid");



    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/job',async(req,res)=>{
        console.log("All job list")
        const result = await Collection.find().toArray();
        res.send(result);
    })
    app.post('/userjob',verifyToken,async(req,res)=>{
        const {email}= req.query;
        console.log("Uer job list");
        const result = await Collection.find({email}).toArray();
        res.send(result);
    })
    app.get('/job/:id',async(req,res)=>{
        const id = req.params.id;
        console.log("User Job List");
        const result = await Collection.findOne({ _id: new ObjectId(id) });
        return res.send(result);
    })

    app.get('/userbid',verifyToken,async(req,res)=>{
        const {email,sort}= req.query;
        console.log("User Bid list");
        if(sort && sort=='sorted')
        {
          const result = await bidCollection.find({userEmail:email}).sort({status:1}).toArray();
          res.send(result);
        }
        else
        {
          const result = await bidCollection.find({userEmail:email}).toArray();
          res.send(result);
        }
        
    })
    app.get('/userbidrequest',verifyToken,async(req,res)=>{
        console.log("User Bid Request");
        const {email}= req.query;
        const result = await bidCollection.find({buyerEmail:email}).toArray();
        res.send(result);
    })
    app.post('/addjob',verifyToken,async(req,res)=>{
        console.log("Add Job Request")
        const job=req.body;
        const result = await Collection.insertOne(job);
        res.send(result);
    });
    app.post('/bidjob',verifyToken,async(req,res)=>{
        console.log("Bid Job List")
        const job=req.body;
        const result = await bidCollection.insertOne(job);
        res.send(result);
    });
    app.patch('/updatebid/:_id', verifyToken,async (req, res) => {
        const id = req.params._id;
        const bid = req.body;
        console.log("Updateb Job Bid Request");
        try {
          const result = await bidCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: bid },
            { upsert: false }
          );
           const updatedDocument = await bidCollection.findOne({ _id: new ObjectId(id) });
          res.send({ result, updatedDocument });
        } catch (error) {
          console.error("Error updating bid:", error);
          res.status(500).send({ error: "Error updating bid" });
        }
      });
      
    app.put("/updatejob/:_id",verifyToken, async (req, res) => {
        const id = req.params._id;
        console.log("Update Job Request");
        const job = req.body;
        const result = await Collection.updateOne(
          { _id: new ObjectId(id) }, 
          {
            $set: job, 
          },
          { upsert: true } 
        );
        res.send({ result });
      });
    app.delete("/jobDelete/:_id", async (req, res) => {
        const id = req.params._id;
        console.log("Job deleted");
        const result = await Collection.deleteOne({_id: new ObjectId(id) });
        res.send(result);
    });

    app.get("/check",(req,res)=>{
      res.send("Welcome to Database");
    })
    
  
  } finally {
git    //await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Welcom to Backend');
})

app.listen(port, () => {
    console.log('Server is running on ',port);
})


