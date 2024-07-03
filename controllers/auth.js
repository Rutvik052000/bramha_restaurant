const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
});

exports.login = async(req, res) =>{
   try {

    const email = req.body.email;
    const password = req.body.password;
    
    if(!email || !password){
        return res.status(400).render('login', {
            message : "please provide email and password"
        })
    }

    db.query("select * from users where email = ?", [email], async(error, results)=>{

        console.log(results);

        if(!results || !(await bcrypt.compare(password, results[0].password))){
            res.status(401).render('login', {
                message : "email or password is incorrect"
            })
        }else{
            const id = results[0].id;

            const token = jwt.sign({id : id}, process.env.JWT_SECRET,{
                expiresIn : process.env.JWT_EXPIRES_IN
            });

            console.log("The token is : "+ token);

            const cookieOptions = {
                expires : new Date(
                    Date.now() + process.env.JWT_COOKIES_EXPIRES * 24 * 60 * 60 *1000
                ),
                httpOnly : true
            }

            res.cookie('jwt', token,  cookieOptions);
            res.status(200).redirect("/");
        }
   })
    
   } catch (error) {
    console.log(error);
   }

   
}

exports.register = (req, res) =>{  //grap all of the data form the form
    console.log(req.body);
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results)=>{
        if(error){
            console.log(error);
        }

        if(results.length > 0){
            return res.render('register', {
                message : "That email is already in use"
            })
        }else if(password !== passwordConfirm){
            return res.render('register', {
                message : "Password do not match"
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);


        db.query('INSERT INTO users SET ?', {first_name:first_name, last_name: last_name, email:email, phone : phone, password : hashedPassword},
            (error, results)=>{
                if(error){
                    console.log(error);
                }else {
                    console.log(results);
                    return res.render('register', {
                        message : "user register successfully"
                    });
                }
            })
        
        

        // res.send("testing");
    });

    // res.send("Form submitted successfully");
}