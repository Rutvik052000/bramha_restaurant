const express = require("express");
const mysql = require("mysql");
const dotenv = require('dotenv');
const path = require('path');
const request = require("http")
const cookieparser = require("cookie-parser")

dotenv.config({path : './.env'});

const app = express();

const db = mysql.createConnection({
    lost : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
})

const publicDirectory = path.join(__dirname, './assets/css');
console.log(publicDirectory);
const publicDirectory1 = path.join(__dirname, './assets/js');
console.log(publicDirectory1);
const publicDirectory2 = path.join(__dirname, './assets/images');
console.log(publicDirectory2);
app.use(express.static(publicDirectory));
app.use(express.static(publicDirectory1));
app.use(express.static(publicDirectory2));

//parse URL-encoded bodies (as send by HTML forms)
app.use(express.urlencoded({extended : false}));

app.use(express.json());
app.use(cookieparser());

app.set('view engine', 'hbs');

db.connect((error)=>{
    if(error){
        console.log(error);
    }else{
        console.log("database connected successfully");
    }
})

//define router in router folder
app.use('/', require('./routes/pages'));

app.use('/auth', require('./routes/auth'));

app.listen(5004, ()=>{
    console.log('Server start on the port 5004');
})