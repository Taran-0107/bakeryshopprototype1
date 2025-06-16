const { sequelize, Product, User, Cart, CartItem, Order, OrderItem ,create_router} = require('../exportmanager/exports');
const router=create_router();

router.get('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByPk(productId);  // Sequelize or DB query
        if (!product) return res.status(404).send("Product not found");

        res.render('product', { product });
    } catch (error) {
        res.status(500).send("Error fetching product");
    }
});

module.exports=router;
