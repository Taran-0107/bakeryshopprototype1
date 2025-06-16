const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.get('/', (req, res) => {
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

router.post('/', async (req, res) => {
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

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.redirect('/login');
  });
});


module.exports = router;