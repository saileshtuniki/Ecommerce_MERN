//it runs on 4000 port//
const port = 4000;
//Import All packages which are required//
const express = require('express');
const app = express();

const mongoose =require('mongoose');
//using jwt we can generate token an verify the token
const jwt = require('jsonwebtoken');
//multer is used for image storage sys
const multer = require('multer');
//Using this path we can access backend Directory in express app//
const path = require('path');
const cors = require('cors');
const { log } = require('console');

app.use (express.json());
app.use(cors());

// Initialize DB//
// database connection with Mongo DB

//use:- node .\index.js for connecting to DB//
 mongoose.connect("mongodb+srv://sailesht:vamshi789@cluster0.qoa1vdn.mongodb.net/e-commerce")

// API Creation//

app.get('/',(req, res)=>{
    res.send("Express App is running")
})

// Text Image storage Engine i.e multer (used for file uploads)//
//dislStorage: it is a storage Engine which stores files in memory as buffers.//
// './upload/images' in this path images get uploaded
const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        //cb:- 'call back it stores two args i.e error, destination where to store the file'
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

// Creating upload endpoint to upload images //

app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating products//
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type: String,
        required:true,
    },
    image:{
        type: String,
        required:true,
    },
    category:{
        type: String,
        required:true,
    },
    new_price:{
        type: Number,
        required:true,
    },
    old_price:{
        type: Number,
        required:true,
    },
    date:{
        type: Date,
        // Here the Date- 'Date.now' is taken from sys current Date//
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },
})

// Endpoint for Add product//
//We have added these below keys and value will come from request that we will send using Thunderclient request
app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({})
    let id;
    if (products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1
    }
    else{
        id=1;
    }
    const product = new Product({
        // id:req.body.id,
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,

    })
    console.log(product);
    // Saved in the DataBase
    await product.save();
    console.log("Saved");
    //Generate Response//
    res.json({
        success:true,
        name: req.body.name,
    })
})

//Creating API for removing Products from DB//
app.post('/removeproduct', async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating API for getting all products/

app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products fetched");
    res.send(products);
})

// Schema creating for user model

const Users = mongoose.model("Users",{
    name:{
        type: String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type: Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating End Point For registering for user

app.post('/signup',async(req,res)=>{

    // Here, It will Check the email is already available or not //
    //if not it will create empty cart//
    let check = await Users.findOne({email:req.body.email});
    if (check){
        return res.status(400).json({success:false, errors:"Existing users found with same Email ID"})
    }
    //Here we will get the key Obj's from 1 to 300
    // Using this cart we will create user name,email,pass,cartdata
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    //saved in the Database using save
    await user.save();

    //now we are creating a token using data obj 
    const data = {
        user:{
            id:user.id
        }
    }
    // after data obj creation we are generating token
    const token = jwt.sign(data,'secret_ecom')
    res.json({success:true,token})
})

//End point for userlogin 
//here Users is the user model//
// 'secret_ecom' is know as salting in jwt //
app.post('/login', async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom')
            res.json({success:true,token})
        }
        else{
            res.json({success:false,errors:"Wrong Password"})
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email ID"})
    }
})

//creating endpoint for newcollection data//
//Here Product is model
app.get('/newcollections',async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection)
})
// creating endpoint for popular in Women
app.get('/popularinwomen', async( req,res)=>{
    let products = await Product.find({category:'women'});
    //here we are fetching 4 products
    let popular_in_women = products.slice(0,4);
    console.log('Popular in women is Fetched');
    res.send(popular_in_women)
})

//creatig a middleware to fetch user

const fetchUser = async(req,res,next)=>{
    const token = req.header('auth-token')
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send({errors:"Plaese authenticate using a valid token"})
        }
    }
}

//creating end point for adding products in cartdata
app.post('/addtocart', fetchUser, async (req,res)=>{
    console.log('Added',req.body.itemId);
    // console.log(req.body,req.user);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Added")
})

//creating endpoint to remove  cartdata

app.post('/removefromcart',fetchUser, async (req,res)=>{
    console.log('removed',req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Removed")
})

//creating endpoint to get cartdata
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id})
    res.json(userData.cartData)
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server running on port" + port);
    }
    else{
        console.log("Error" +error);
    }
})