
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');
require('dotenv').config()
// console.log(process.env.DB_PASS)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvtdy.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const app = express()
app.use(cors())
app.use(bodyParser.json())



var serviceAccount = require("./configs/simplesignin-989ae-firebase-adminsdk-gqz6z-86ff58c9b5.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
const bookingCollection = client.db("burjAlArab").collection("bookings");

app.post('/addBookings', (req , res) => {
    const newBookings = req.body;
    
    bookingCollection.insertOne(newBookings)
    .then(result => {   
    res.send(result.insertedCount > 0)     
    })
 

    })


    app.get('/bookings', (req, res)=>{
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];     
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
           if(tokenEmail == queryEmail){
            bookingCollection.find({email: queryEmail})
            .toArray((err, result) =>{
              res.status(200).send(result)
            
            })
          }
          else{
            res.status(401).send('Un-authorize access')
          }
          // ...
        })
        .catch((error) => {
          res.status(401).send('Un-authorize access')
        });

      }

      else{
        res.status(401).send('Un-authorize access')
      }
       
    }) 
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(5000)