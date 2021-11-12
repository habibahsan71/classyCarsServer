const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;



const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5s9y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {

    try {
        await client.connect();
        const database = client.db('carWorld');
        const servicesCollection = database.collection('services');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("review");
        //get product api
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.post("/addUserInfo", async (req, res) => {
            console.log("req.body");
            const result = await usersCollection.insertOne(req.body);
            res.send(result);
            console.log(result);
        });
        //POST api
        app.post('/services', async (req, res) => {
            const services = req.body;
            // console.log('hit the post api', services);

            const result = await servicesCollection.insertOne(services);
            // console.log(result);
            res.json(result);
        })

        //review
        app.post("/addReview", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        })

        // POST All order api
        app.post('/AllOrder', async (req, res) => {
            const OrderList = req.body;
            // console.log('order hit the server', OrderList);


            const result = await orderCollection.insertOne(OrderList);
            // // console.log(result);
            res.json(result);
        })

        //Get All Order api
        app.get('/AllOrder', async (req, res) => {
            const cursor = orderCollection.find({});
            const AllOrder = await cursor.toArray();
            res.send(AllOrder);
        })


        //Delete api
        app.delete('/AllOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            // console.log('deleting user with id', result)
            res.json(result);
        })


        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.deleteOne(query);
            res.json(result)
        })
        //Update API 

        app.put('/AllOrder/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            // console.log(`your id nong`, id, updatedStatus);
            res.send(result)
        })


        app.put("/makeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await usersCollection.find(filter).toArray();
            if (result) {
                const documents = await usersCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
                console.log(documents);
            }
            // else {
            //   const role = "admin";
            //   const result3 = await usersCollection.insertOne(req.body.email, {
            //     role: role,
            //   });
            // }

            // console.log(result);
        });
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await usersCollection
                .find({ email: req.params.email })
                .toArray();
            console.log(result);
            res.send(result);
        });



    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Server Is Running');
});

app.listen(port, () => {
    console.log('Server Running At Port', port);
});