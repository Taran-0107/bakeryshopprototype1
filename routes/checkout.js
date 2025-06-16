const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.get('/', async (req, res) => {
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


router.post('/', async (req, res) => {
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

module.exports=router;