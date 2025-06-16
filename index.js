require('mysql2');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
// const { sequelize, Product, User, Cart, CartItem } = require('./models/Product');
const { sequelize, Product, User, Cart, CartItem, Order, OrderItem } = require('./models/Product');
// const { Sequelize, Op } = require('sequelize');
const route_app=require('./exportmanager/routemanage');

const app = express();


app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Create a new session store using the database
const mySessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(session({
  secret: process.env.SESSION_SECRET, // LOAD THIS FROM ENVIRONMENT VARIABLES!
  store: mySessionStore,
  resave: false,
  saveUninitialized: false, // Set to false for best practice
}));

// This will create the 'Sessions' table in your database if it doesn't exist
mySessionStore.sync();

app.get('/', (req, res) => {
  res.redirect('/login');
});

// Middleware to fetch cart count
app.use(async (req, res, next) => {
  if (req.session.userId) {
    const cart = await Cart.findOne({
      where: { customerId: req.session.userId },
      include: [CartItem]
    });

    let count = 0;
    if (cart) {
      cart.CartItems.forEach(item => count += item.quantity);
    }
    res.locals.cartCount = count;
  } else {
    res.locals.cartCount = 0;
  }
  next();
});

//Routing the app
route_app(app);

// --- DATABASE CONNECTION CHECK ---
// This part is for checking the connection and logging. It does not start the server.
// When your Vercel function starts (a "cold start"), this code will run.
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


// --- EXPORT THE APP FOR VERCEL ---
// This is the most important part. Vercel uses this to handle requests.
module.exports = app;

// This block will only run if the server is NOT on Vercel
if (process.env.VERCEL_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  
  // This line was removed for Vercel, but we need it for local development
  app.listen(PORT, () => {
    console.log(`✅ Server is running locally on http://localhost:${PORT}`);
  });
}
