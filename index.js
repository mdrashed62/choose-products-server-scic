const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lic5ni0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server
    // await client.connect();

    const productsCollection = client.db('chooseProducts').collection('products');

    app.get('/products', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const sort = req.query.sort === 'asc' ? 1 : -1;
        const filter = req.query;
        console.log(page, size, filter)

        const query = {
          name: {$regex: filter.search, $options: 'i'}
        };
        const options = {
          sort: { price: sort },
        };

        const result = await productsCollection.find(query, options)
          .skip(page * size)
          .limit(size)
          .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching products.' });
      }
    });

    // Start pagination
    app.get('/productsCount', async (req, res) => {
      try {
        const count = await productsCollection.estimatedDocumentCount();
        res.send({ count });
      } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching product count.' });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Product server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
