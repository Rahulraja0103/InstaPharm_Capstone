// import all the modules you need
//Capstone Project
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const session = require('express-session');

// set up express-validator
const {check, validationResult} = require('express-validator');
const { Console } = require('console');
const { stringify } = require('querystring');

// connect to DB
mongoose.connect('mongodb://localhost:27017/instaPharmDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//set up the model
const Customers = mongoose.model('Customers', {
    fname : String,
    lname : String,
    phoneNumber : String,
    gender : String,
    dob : Date,
    email : String,
    password : String,
    confirmpassword : String,
});

const Products = mongoose.model('Products', {
    productName : String,
    productImageName : String,
    productType : String,
    offerprice : Number,
    mRP : Number,
    category : String,
    countryOfOrigin : String,
});

// define model for adminuser
const User = mongoose.model('User', {
    userName : String,
    userPassword : String
    
});


//set up the app
var myApp = express();

//set up the body-parser middleware
myApp.use(express.urlencoded({extended: false}));
myApp.use(fileUpload()); // set up the express file upload middleware to be used with Express

//define and set the paths to public and views folder
myApp.set('view engine','ejs');
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));

// define the route for index page "/"
myApp.get('/', function(req, res){
    res.render('homescreen');
});

// define the route for index page "/"
myApp.get('/homescreen', function(req, res){
    res.render('homescreen');
});

myApp.get('/covidEssentials', function(req, res){
    Products.find({"category":/Covid_Essentials/}).exec(function (err, products) {
        console.log(err);
        res.render("covidEssentials", { products: products }); // will render views/allCards.ejs
      });
   
});

myApp.get('/adminHome', function(req, res){
    Customers.find({}).exec(function (err, customer) {
    res.render("adminHome", { customer: customer });
});
});

myApp.get('/generalmedicines', function(req, res){
    Products.find({"category":/General/}).exec(function (err, products) {
        console.log(err);
        res.render("generalmedicines", { products: products }); // will render views/allCards.ejs
      });
   
});

myApp.get('/print/:productid', function(req, res){
    // --------add some logic to put this page behind login---------
    // write some code to fetch a card and create pageData
    var productId = req.params.productid;
    Products.findOne({_id: productId}).exec(function(err, product){
        res.render('productDetails', product); // render card.ejs with the data from card
    });
})

myApp.get('/generalMedicines', function(req, res){
    res.render('generalMedicines');
});

myApp.get('/ayurvedic', function(req, res){
    res.render('ayurvedic');
});

myApp.get('/immunityBoosters', function(req, res){
    res.render('immunityBoosters');
});

myApp.get('/firstAid', function(req, res){
    res.render('firstAid');
});



// set up the session middleware
myApp.use(session({
    secret: 'finalsecret',
    resave: false,
    saveUninitialized: true
}));

//set up routes
myApp.get('/setup', function(req,res){
    let userData = [
        {
            userName: 'admin',
            userPassword: 'admin'
        }
    ]
    User.collection.insertMany(userData);
});


// show login view
myApp.get('/login',function(req, res){
    res.render('login');
});

myApp.get('/loginAdmin',function(req, res){
    res.render('loginAdmin');
});


//handle post method for login page  
myApp.post('/login', function(req, res){

    // fetch username and password
     var email = req.body.email;
     var password = req.body.Password;
     // find it in database
     Customers.findOne({email: email, password: password}).exec(function(err, customers){
            console.log('errors: ' + err);
            if(customers){
             req.session.email = customers.email;
             req.session.loggedIn = true;
             //redirect to view all requests
             res.redirect('/homescreen');
            }
            else{
             res.redirect('/login'); // incase u want to redirect the user to login
            }
     });
     
 })

//handle post method for login page  
myApp.post('/loginAdmin', function(req, res){

   // fetch username and password
    var userName = req.body.userName;
    var userPassword = req.body.userPassword;
    // find it in database
    User.findOne({userName: userName, userPassword: userPassword}).exec(function(err, user){
           console.log('errors: ' + err);
           if(user){
            req.session.userName = user.userName;
            req.session.loggedIn = true;
            //redirect to view all requests
           res.redirect('/adminHome');
           }
           else{
        res.redirect('/loginAdmin'); // incase u want to redirect the user to login
           }
    });
    
})

myApp.post('/login', function(req, res){

    // fetch username and password
     var email = req.body.email;
     var password = req.body.password;
     // find it in database
     Customers.findOne({email: email, password: password}).exec(function(err, customers){
            console.log('errors: ' + err);
            if(customers){
             req.session.email = customers.email;
             req.session.loggedIn = true;
             //redirect to view all requests
             res.redirect('/homescreen');
            }
            else{
             res.redirect('/login'); // incase u want to redirect the user to login
            }
     });
     
 
 
 
  
 })

//Set to destroy the session
myApp.get('/logout', function(req,res){
    req.session.userName = '';
    req.session.loggedIn = false;
    res.render('logout');
});


// show all data from db in view request file
myApp.get('/viewrequests',function(req, res){

    if (req.session.loggedIn){
    // write some code to fetch all the enteries from db and send to the  viewrequests file
    Customers.find({}).exec(function(err, customers){
        res.render('viewrequests', {customers:customers}); // will render views/viewrequests.ejs
    });
   }
   else{
    res.redirect('/login');
   }
});

// show logout view
myApp.get('/logout',function(req, res){
    res.render('/logout');
});

// show register view
myApp.get('/register',function(req, res){
    res.render('register');
});

// show register Success view
myApp.get('/successRegister',function(req, res){
    res.render('successRegister');
});

//handle post method for form view  
myApp.post('/register', function(req, res){
    console.log("hhhhhhhhhhhh");
    const errors = validationResult(req);
    if(!errors.isEmpty()){ 

        // Executed only when errors are there.
        console.log(req.body);
        res.render('register', {
            errors: errors.array(),
             userData: req.body 
        });

    }
    else{ 
        
        // if no errors are there
        var fname = req.body.fname;
        var lname = req.body.lname;
        var phoneNumber = req.body.phoneNumber;
        var gender = req.body.gender;
        var dob = req.body.dob;
        var email = req.body.email;
        var password =req.body.password;
        var confirmpassword = req.body.confirmpassword;

        // prepare data to send to the view
        var pageData = {
        fname : fname,
         lname: lname,
         email : email,
         phoneNumber : phoneNumber,
         gender : gender,
         dob : dob,
         password : password,
         confirmpassword : confirmpassword,
     
         } 

            var myCustomer = new Customers(pageData);
            myCustomer.save(); //saves the data to db
            console.log("added",pageData);
           // res.render('viewsinglerequest', pageData);//This will render the Thank you page with details.
            
           res.render('successRegister', pageData);

    }

})

// show register view
myApp.get('/addProducts',function(req, res){
    res.render('addProducts');
});

//add Products
//handle post method for form view  
myApp.post('/addProducts', function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){ 

        // Executed only when errors are there.
        console.log(req.body);
        res.render('addProducts', {
            errors: errors.array(),
             userData: req.body 
        });
    }
    else{     
        // if no errors are there
        var productName = req.body.productname;
        var productImageName = req.files.productimage.name;
        var imageFile = req.files.productimage;
        var productType = req.body.productType;
        var offerprice = req.body.offerPrice;
        var mRP = req.body.mRP;
        var category = req.body.category;
        var countryOfOrigin =req.body.countryOfOrigin;

        var ImagePath = "public/uploads/" + productImageName;
  //move the temprory file to a permanent location
  imageFile.mv(ImagePath, function (err) {
    console.log(err);
  });

        // prepare data to send to the view
        var pageData = {
            productName : productName,
            productImageName: productImageName,
            productType : productType,
            offerprice : offerprice,
            mRP : mRP,
            category : category,
            countryOfOrigin : countryOfOrigin,
     
         } 

            var myproduct = new Products(pageData);
            myproduct.save(); //saves the data to db
            console.log("added",pageData);
           // res.render('viewsinglerequest', pageData);//This will render the Thank you page with details.
            
           res.render('productAddedSuccess', pageData);

    }

})

// start the server (listen at a port)
myApp.listen(8080);
console.log('Everything executed, open http://localhost:8080/ in the browser.')