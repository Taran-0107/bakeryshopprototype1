const express = require('express');
const { sequelize, Product, User, Cart, CartItem, Order, OrderItem } = require('../models/Product');
const { Op } = require('sequelize');

function create_router(){
    return express.Router()
}

module.exports = {
  sequelize,
  User,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Op,
  create_router
};