const express = require('express')
const app = express()
var cors = require('cors')
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://gadgetUser:lLnemO6hLWDFvVJ0@cluster0.uf72x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

/**
 * clien site collect email => send to backend 
 * abc@abc.com fl;sadkjlfkjdsa;lfkjdsa;lfkjdsa;lkjf;ldsakfj
 * fjlsajf;lkdsajf;lkdsaj <====== decode 
 */


async function run() {
    try {
        await client.connect();
        console.log('db connect')

        const productCollection = client.db("gadgetFreak").collection("products");
        const orderCollection = client.db("gadgetFreak").collection("orders");

        // app.post("/login", (req, res) => {
        //     const email = req.body;

        //     const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);

        //     res.send({ token })
        // })

        app.post('/login', (req, res) => {
            const secret_key = 'IMJU7hS1IEmodbUM/2C30FeNJWY+Ee/YPwFPO5qpnaOS8gPzo6rbeWcTJYgx/dAZ7Iu/lH2N+6kL6S86zz2V33MwMZ3shJrOaYAcTxUw3FGjahJfclfa2nW5z7/zP1P6ltxf1y77ww9JYn4w4yuq4ATAjUbQGJPyrV8RymsW+v1LgZwPWDdYoizh/UBOvyz0nlwXoHSTnYKU1dPmNa8XFTyCAYZdtpQC0zR0NwF14zDIdubIAibNdaQQevYsc8pnJWgccOyFcGRkCE8hy1GQC4L0mhfryHTL5OM9eT6RzROhKKIA7zhHB2kRNcKNZ2k+O1/zL4Wumiu/TQK33G47Eg=='
            const email = req.body
            const token = jwt.sign(email, secret_key);

            res.send({ token })

        })

        app.post("/uploadPd", async (req, res) => {
            const product = req.body;
            const tokenInfo = req.headers.authorization
            const [email, accessToken] = tokenInfo.split(" ")
            const decoded = verifyToken(accessToken)

            if (product.name && product.price) {
                if (email === decoded.email) {
                    const result = await productCollection.insertOne(product);
                    res.send({ success: 'Product Upload Successfully' })
                } else {
                    res.send({ message: "Unauthorized user" })
                }
            }

            // const tokenInfo = req.headers.authorization;
            // // console.log(tokenInfo)
            // const [email, accessToken] = tokenInfo.split(" ")
            // // console.log(email, accessToken)

            // const decoded = verifyToken(accessToken)

            // if (email === decoded.email) {
            // }
            // else {
            //     res.send({ success: 'UnAuthoraized Access' })
            // }



        })

        app.get("/products", async (req, res) => {
            const limit = +req.query.limit
            const pageNumber = +req.query.pageNumber
            const cursor = productCollection.find({}).limit(limit).skip(pageNumber * limit)
            const products = await cursor.toArray();
            const count = await productCollection.estimatedDocumentCount()
            res.send({ products, count });
        })

        app.post("/addOrder", async (req, res) => {
            const orderInfo = req.body;

            const result = await orderCollection.insertOne(orderInfo);
            res.send({ success: 'order complete' })
        })

        app.get("/orderList", async (req, res) => {
            const email = req.query.email

            // const tokenInfo = req.headers.authorization;

            // console.log(tokenInfo)
            // const [email, accessToken] = tokenInfo.split(" ")
            // // console.log(email, accessToken)

            // const decoded = verifyToken(accessToken)
            // if (email === decoded.email) {
            // }
            // else {
            //     res.send({ success: 'UnAuthoraized Access' })
            // }


            const orders = await orderCollection.find({ email: email }).toArray();
            res.send(orders);

        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


const verifyToken = token => {
    const secret_key = 'IMJU7hS1IEmodbUM/2C30FeNJWY+Ee/YPwFPO5qpnaOS8gPzo6rbeWcTJYgx/dAZ7Iu/lH2N+6kL6S86zz2V33MwMZ3shJrOaYAcTxUw3FGjahJfclfa2nW5z7/zP1P6ltxf1y77ww9JYn4w4yuq4ATAjUbQGJPyrV8RymsW+v1LgZwPWDdYoizh/UBOvyz0nlwXoHSTnYKU1dPmNa8XFTyCAYZdtpQC0zR0NwF14zDIdubIAibNdaQQevYsc8pnJWgccOyFcGRkCE8hy1GQC4L0mhfryHTL5OM9eT6RzROhKKIA7zhHB2kRNcKNZ2k+O1/zL4Wumiu/TQK33G47Eg=='
    let email;
    jwt.verify(token, secret_key, function (err, decoded) {
        if (err) {
            email = 'Invalid email'
        }
        if (decoded) {
            email = decoded
        }
    });

    return email
}

// verify token function
// function verifyToken(token) {
//     let email;
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             email = 'Invalid email'
//         }
//         if (decoded) {
//             console.log(decoded)
//             email = decoded
//         }
//     });
//     return email;
// }