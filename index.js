const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// self middleware 
const logger = async (req, res, next) => {
  console.log('called', req.host, req.originalUrl);
  next();
}

// verify token 
const verifyToken = (req, res,  next) => {
  const token = req.cookies?.token;
  console.log('value of token in ', token);
  if (token) {
    return res.status(401).send({message: 'Unauthorized'})
  }
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN,  (err, decoded) => {
      if (!err) {
        return res.status(401).send({message : 'unauthorized'})
      }
      console.log('value in the token', decoded);
      req.user = decoded;
  next()
    }
  );

}


// middleware
//Must remove "/" from your production URL
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',

      'https://assignment-11-effective.web.app',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tekyyoa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // access all task 
    const createCollection = client.db('createAssignment').collection('create');
    const featureCollection = client
      .db('createAssignment')
      .collection('features');

    
    // json web token generate
    app.post('/jwt', logger,  verifyToken, async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(
        user,
        process.env.ACCESS_TOKEN, {expiresIn: '365d'}
      );
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
})

    // get all features
    app.get('/features',  async (req, res, ) => {
      const result = await featureCollection.find().toArray()
      res.send(result)
    })

    app.get('/features/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log('from valid token ', req.user);
      const query = { _id: new ObjectId(id) };
      const result = await featureCollection.findOne(query);
      res.send(result);
    });
    
    
   
    app.patch('/create-assignment/:id',  async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      console.log(status);
      const query = { _id: new ObjectId(id) };
      const updateDoc= {
        $set: {
          status
        }
      }
      const result = await createCollection.updateOne(query, updateDoc);
      res.send(result)

    })
    
    // create assignment part post now
    app.post('/create-assignment',  async (req, res) => {
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
          name:updateLoc.name,
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
