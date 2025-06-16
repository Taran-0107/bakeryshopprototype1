const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.post('/update/:productId', async (req, res) => {
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


router.post('/add-to-cart/:productId', async (req, res) => {
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


router.get('/', async (req, res) => {
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

module.exports=router;