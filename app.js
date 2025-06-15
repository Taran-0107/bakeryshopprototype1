const express = require('express');
const session = require('express-session');
const path = require('path');
// const { sequelize, Product, User, Cart, CartItem } = require('./models/Product');
const { sequelize, Product, User, Cart, CartItem, Order, OrderItem } = require('./models/Product');


// const { Sequelize, Op } = require('sequelize');
const { Op } = require('sequelize');


const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

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

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.redirect('/login');
  });
});

app.get('/signup', (req, res) => {
  res.render('CreateAccount');
});

app.post('/signup', async (req, res) => {
  const { name, email, phone, password, confirm_password } = req.body;
  try {
    if (password !== confirm_password) return res.status(400).send('Passwords do not match.');

    const emailUser = await User.findOne({ where: { email } });
    if (emailUser) return res.status(400).send('Email already in use.');

    const phoneUser = await User.findOne({ where: { phone } });
    if (phoneUser) return res.status(400).send('Phone number already in use.');

    const newUser = await User.create({ name, email, phone, password, role: 'customer' });
    req.session.userId = newUser.userId;
    req.session.userName = newUser.name;
    req.session.userRole = newUser.role;
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

app.get('/profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).send('User not found');
    res.render('profile', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

app.post('/profile', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!req.session.userId) return res.redirect('/login');

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).send('User not found');

    const emailUser = await User.findOne({ where: { email } });
    if (emailUser && emailUser.userId !== user.userId) return res.status(400).send('Email already in use.');

    const phoneUser = await User.findOne({ where: { phone } });
    if (phoneUser && phoneUser.userId !== user.userId) return res.status(400).send('Phone number already in use.');

    user.name = name;
    user.email = email;
    user.phone = phone;
    await user.save();

    req.session.userName = user.name;
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

async function checkGmail_phone(email_phone) {
  const input = email_phone.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91[\-\s]?|0)?[6-9]\d{9}$/;
  if (emailRegex.test(input)) return 'email';
  if (phoneRegex.test(input)) return 'phone';
  return 'invalid';
}

app.post('/login', async (req, res) => {
  try {
    const email_phone = req.body.email_phone.trim();
    const password = req.body.password;
    const type = await checkGmail_phone(email_phone);

    if (type === 'invalid') return res.status(400).send('Invalid email or phone number format.');

    let user;
    if (type === 'email') user = await User.findOne({ where: { email: email_phone } });
    if (type === 'phone') user = await User.findOne({ where: { phone: email_phone } });

    if (!user) return res.status(401).send('User not found.');
    if (user.password !== password) return res.status(401).send('Incorrect password.');

    req.session.userId = user.userId;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});



// app.get('/home', async (req, res) => {
//   if (!req.session.userId) return res.redirect('/login');

//   try {
//     const selectedCategory = req.query.category;
//     let products;

//     if (selectedCategory) {
//       products = await Product.findAll({ where: { category: selectedCategory } });
//     } else {
//       products = await Product.findAll();
//     }

//     const categories = await Product.findAll({
//       attributes: ['category'],
//       group: ['category']
//     });

//     const userName = req.session.userName;

//     res.render('home', {
//       products,
//       categories,
//       userName,
//       selectedCategory
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Something went wrong!');
//   }
// });



// const { Op } = require('sequelize'); // Make sure to include this at the top

app.get('/home', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const selectedCategory = req.query.category;
    const searchQuery = req.query.search; // Get search input from query
    let whereClause = {};

    // If a category is selected
    if (selectedCategory) {
      whereClause.category = selectedCategory;
    }

    // If a search term is provided
    if (searchQuery) {
      whereClause.productName = { [Op.like]: `%${searchQuery}%` };
    }

    // Fetch filtered or all products
    const products = await Product.findAll({ where: whereClause });

    // Get distinct categories
    const categories = await Product.findAll({
      attributes: ['category'],
      group: ['category']
    });

    res.render('home', {
      products,
      categories,
      userName: req.session.userName,
      selectedCategory,
      searchQuery // So you can pre-fill the search box in EJS
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});




//Product


// Example: in app.js or separate route file
app.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByPk(productId);  // Sequelize or DB query
        if (!product) return res.status(404).send("Product not found");

        res.render('product', { product });
    } catch (error) {
        res.status(500).send("Error fetching product");
    }
});



//check out page
app.get('/checkout', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const userId = req.session.userId;
    const cart = await Cart.findOne({ where: { customerId: userId } });
    if (!cart) return res.redirect('/home');

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.cartId },
      include: [Product]
    });

    let total = 0;
    const items = cartItems.map(item => {
      const subtotal = item.quantity * item.Product.price;
      total += subtotal;
      return {
        name: item.Product.productName,
        price: item.Product.price,
        quantity: item.quantity,
        subtotal
      };
    });

    res.render('checkout', { items, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading checkout');
  }
});



app.post('/checkout', async (req, res) => {
  const { paymentMethod } = req.body;
  const userId = req.session.userId;

  try {
    const cart = await Cart.findOne({ where: { customerId: userId } });
    if (!cart) return res.status(400).send('Cart not found');

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.cartId },
      include: [Product]
    });

    let totalAmount = 0;
    for (let item of cartItems) {
      if (item.Product.stock < item.quantity) {
        return res.status(400).send(`Not enough stock for ${item.Product.productName}`);
      }
      totalAmount += item.Product.price * item.quantity;
    }

    const order = await Order.create({
      customerId: userId,
      totalPrice: totalAmount,
      paymentMode: paymentMethod
    });

    for (let item of cartItems) {
      await OrderItem.create({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity
      });

      item.Product.stock -= item.quantity;
      await item.Product.save();
    }

    await CartItem.destroy({ where: { cartId: cart.cartId } });

    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to place order');
  }
});



// show history of order


app.get('/orders', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect('/login');

  try {
    const orders = await Order.findAll({
      where: { customerId: userId },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['orderDate', 'DESC']]
    });

    res.render('orders', { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch order history");
  }
});





// update in cart

app.post('/cart/update/:productId', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const { productId } = req.params;
    const { action } = req.body;
    const userId = req.session.userId;

    const cart = await Cart.findOne({ where: { customerId: userId } });
    if (!cart) return res.redirect('/cart');

    const item = await CartItem.findOne({ where: { cartId: cart.cartId, productId } });
    if (!item) return res.redirect('/cart');

    if (action === 'increase') {
      item.quantity += 1;
    } else if (action === 'decrease') {
      item.quantity = Math.max(0, item.quantity - 1);
    }

    if (item.quantity === 0) {
      await item.destroy(); // Remove item from cart if quantity is 0
    } else {
      await item.save();
    }

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update cart.');
  }
});


app.post('/add-to-cart/:productId', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const userId = req.session.userId;
    const productId = req.params.productId;
    const quantityToAdd = parseInt(req.query.quantity) || 1;

    let cart = await Cart.findOne({ where: { customerId: userId } });
    if (!cart) cart = await Cart.create({ customerId: userId, totalPrice: 0 });

    let item = await CartItem.findOne({ where: { cartId: cart.cartId, productId } });
    if (item) {
      item.quantity += quantityToAdd;
      await item.save();
    } else {
      await CartItem.create({ cartId: cart.cartId, productId, quantity: quantityToAdd });
    }

    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to add to cart.');
  }
});


app.get('/cart', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const cart = await Cart.findOne({
      where: { customerId: req.session.userId },
      include: {
        model: CartItem,
        include: Product
      }
    });

    let items = [];
    let total = 0;

    if (cart) {
      items = cart.CartItems.map(item => {
        const subtotal = item.quantity * item.Product.price;
        total += subtotal;
        return {
          productId: item.Product.productId,
          name: item.Product.productName,
          price: item.Product.price,
          quantity: item.quantity,
          subtotal
        };
      });
    }

    res.render('cart', { items, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load cart.');
  }
});


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
