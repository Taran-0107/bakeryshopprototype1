const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User Model
const User = sequelize.define('Users', {
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer'),
    allowNull: false,
  }
}, {
  tableName: 'Users',
  timestamps: false
});

// Product Model
const Product = sequelize.define('Product', {
  productId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productDescription: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'Product',
  timestamps: false
});

// Cart Model
const Cart = sequelize.define('Cart', {
  cartId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'Cart',
  timestamps: false
});

// CartItem Model
const CartItem = sequelize.define('CartItem', {
  cartItemId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'CartItem',
  timestamps: false
});

// Associations

// A User (customer) can have one Cart
User.hasOne(Cart, {
  foreignKey: 'customerId',
  onDelete: 'CASCADE'
});
Cart.belongsTo(User, {
  foreignKey: 'customerId'
});

// A Cart can have many CartItems
Cart.hasMany(CartItem, {
  foreignKey: 'cartId',
  onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cartId'
});

// A Product can appear in many CartItems
Product.hasMany(CartItem, {
  foreignKey: 'productId'
});
CartItem.belongsTo(Product, {
  foreignKey: 'productId'
});





// for the order and ordercart

// Order Model
const Order = sequelize.define('Order', {
  orderId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentMode: {
    type: DataTypes.ENUM('Online', 'CashOnShop'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Placed', 'Prepared', 'Collected'),
    defaultValue: 'Placed'
  }
}, {
  tableName: 'Orders',
  timestamps: false
});

// OrderItem Model
const OrderItem = sequelize.define('OrderItem', {
  orderItemId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'OrderItem',
  timestamps: false
});


// A User (customer) can have many Orders
User.hasMany(Order, {
  foreignKey: 'customerId',
  onDelete: 'CASCADE'
});
Order.belongsTo(User, {
  foreignKey: 'customerId'
});

// An Order can have many OrderItems
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId'
});

// A Product can appear in many OrderItems
Product.hasMany(OrderItem, {
  foreignKey: 'productId'
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId'
});


Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });





module.exports = {
  sequelize,
  User,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem
};

