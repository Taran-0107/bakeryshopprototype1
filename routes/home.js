const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router,Op} = require('../exportmanager/exports');
const router=create_router();

router.get('/', async (req, res) => {
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

module.exports=router;