const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.get('/', async (req, res) => {
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

module.exports=router;