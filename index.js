const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);

const uri =
  'mongodb+srv://AssignmentProject:bhOgRL48kNODxzj8@cluster0.tekyyoa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const createCollection = client.db('createAssignment').collection('create');

    // create assignment part post now
    app.post('/create-assignment', async (req, res) => {
      const create = req.body;
      console.log(create);
      const result = await createCollection.insertOne(create);
      res.send(result);
    });

   
    //  delete one item in UI
    app.delete('/create-assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await createCollection.deleteOne(query);
      res.send(result);
    });

    app.put('/create-assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateLoc = req.body;
      console.log(updateLoc);
      const updateDoc = {
        $set: {
          label: updateLoc.label,
          mark: updateLoc.mark,
          photo: updateLoc.photo,
          title: updateLoc.title,
          description: updateLoc.description,
        },
      };
      const result = await createCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    //  create assignment id to get item
    app.get('/create-assignment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await createCollection.findOne(query);
      res.send(result);
    });

    // create assignment get now
    app.get('/create-assignment', async (req, res) => {
      const cursor = await createCollection.find().toArray();
      res.send(cursor);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

// app get & listen going on
app.get('/', (req, res) => {
  res.send('Assignment running on');
});
app.listen(port, () => {
  console.log(`assignment running on port : ${port}`);
});
