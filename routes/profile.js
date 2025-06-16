const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
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

module.exports=router;