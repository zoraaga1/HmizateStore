const express = require("express");
const dotenv = require ("dotenv");
const mongoose = require("mongoose");
const products = require("./routes/productRoutes");
const cors = require("cors")
const user = require("./routes/userRoutes")
const bookingRoutes = require('./routes/bookingRoutes');
const vercel = require("./routes/vercel");
const chat = require("./routes/messagesRoutes")

dotenv.config();
const app = express();

const port = process.env.PORT;
const mongoDB_URI = process.env.MONGO_URI;


app.use(cors());
app.use(express.json())

app.use("/api/products", products);
app.use("/api/users", user);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vercel", vercel)
app.use("/api/chat", chat)



//Get connect to the database
mongoose.connect(mongoDB_URI)
.then(
    async () => {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Connecting to DB successfully")
    }
)
.catch((err) => {
    console.log(err);
});

//Create server
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})