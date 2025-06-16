const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.get('/', (req, res) => {
  res.render('CreateAccount');
});
router.post('/', async (req, res) => {
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

module.exports = router;