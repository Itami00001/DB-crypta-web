const Joi = require('joi');
const uuidSchema = Joi.string().guid({ version: ['uuidv4', 'uuidv5'] });

// User validation schemas
const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  passwordHash: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
  isVerified: Joi.boolean().optional()
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  passwordHash: Joi.string().min(6).optional(),
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
  isVerified: Joi.boolean().optional()
});

// News Post validation schemas
const createNewsPostSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  content: Joi.string().min(10).required(),
  postType: Joi.string().valid('news', 'prediction', 'analysis', 'announcement').optional(),
  category: Joi.string().max(100).optional(),
  isPublished: Joi.boolean().optional(),
  authorId: uuidSchema.required()
});

const updateNewsPostSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  content: Joi.string().min(10).optional(),
  postType: Joi.string().valid('news', 'prediction', 'analysis', 'announcement').optional(),
  category: Joi.string().max(100).optional(),
  isPublished: Joi.boolean().optional()
});

// Crypto Wallet validation schemas
const createCryptoWalletSchema = Joi.object({
  walletAddress: Joi.string().min(10).max(255).required(),
  walletType: Joi.string().valid('hardware', 'software', 'exchange', 'paper').required(),
  balance: Joi.number().min(0).optional(),
  currencyCode: Joi.string().length(3).uppercase().required(),
  isActive: Joi.boolean().optional(),
  userId: uuidSchema.required()
});

const updateCryptoWalletSchema = Joi.object({
  walletAddress: Joi.string().min(10).max(255).optional(),
  walletType: Joi.string().valid('hardware', 'software', 'exchange', 'paper').optional(),
  balance: Joi.number().min(0).optional(),
  currencyCode: Joi.string().length(3).uppercase().optional(),
  isActive: Joi.boolean().optional()
});

// Transaction validation schemas
const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currencyCode: Joi.string().length(3).uppercase().required(),
  transactionType: Joi.string().valid('transfer', 'buy', 'sell', 'deposit', 'withdraw').required(),
  status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled').optional(),
  fee: Joi.number().min(0).optional(),
  transactionHash: Joi.string().max(255).optional(),
  fromWalletId: uuidSchema.required(),
  toWalletId: uuidSchema.required()
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  currencyCode: Joi.string().length(3).uppercase().optional(),
  transactionType: Joi.string().valid('transfer', 'buy', 'sell', 'deposit', 'withdraw').optional(),
  status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled').optional(),
  fee: Joi.number().min(0).optional(),
  transactionHash: Joi.string().max(255).optional()
});

// Crypto Currency validation schemas
const createCryptoCurrencySchema = Joi.object({
  symbol: Joi.string().length(3).uppercase().required(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  currentPrice: Joi.number().min(0).optional(),
  marketCap: Joi.number().min(0).optional(),
  volume24h: Joi.number().min(0).optional(),
  iconUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional()
});

const updateCryptoCurrencySchema = Joi.object({
  symbol: Joi.string().length(3).uppercase().optional(),
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).optional(),
  currentPrice: Joi.number().min(0).optional(),
  marketCap: Joi.number().min(0).optional(),
  volume24h: Joi.number().min(0).optional(),
  iconUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional()
});

// Comment validation schemas
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  userId: uuidSchema.required(),
  postId: uuidSchema.required(),
  parentCommentId: uuidSchema.allow(null).optional()
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).optional(),
  isDeleted: Joi.boolean().optional()
});

// User Prediction validation schemas
const createUserPredictionSchema = Joi.object({
  predictedPrice: Joi.number().positive().required(),
  targetPrice: Joi.number().positive().required(),
  predictionType: Joi.string().valid('bullish', 'bearish', 'neutral').required(),
  userId: uuidSchema.required(),
  currencyId: uuidSchema.required(),
  predictionDate: Joi.date().required(),
  targetDate: Joi.date().min(Joi.ref('predictionDate')).required(),
  isActive: Joi.boolean().optional(),
  notes: Joi.string().max(1000).optional()
});

const updateUserPredictionSchema = Joi.object({
  predictedPrice: Joi.number().positive().optional(),
  targetPrice: Joi.number().positive().optional(),
  predictionType: Joi.string().valid('bullish', 'bearish', 'neutral').optional(),
  predictionDate: Joi.date().optional(),
  targetDate: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
  notes: Joi.string().max(1000).optional()
});

// Like validation schemas
const createLikeSchema = Joi.object({
  userId: uuidSchema.required(),
  postId: uuidSchema.required(),
  likeType: Joi.string().valid('like', 'dislike', 'love').required()
});

const updateLikeSchema = Joi.object({
  likeType: Joi.string().valid('like', 'dislike', 'love').optional()
});

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source]);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        message: 'Validation error',
        details: errorMessage
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

const authJwt = require("./auth.middleware");

module.exports = {
  validate,
  createUserSchema,
  updateUserSchema,
  createCryptoCurrencySchema,
  updateCryptoCurrencySchema,
  createCryptoWalletSchema,
  updateCryptoWalletSchema,
  createTransactionSchema,
  updateTransactionSchema,
  createNewsPostSchema,
  updateNewsPostSchema,
  createCommentSchema,
  updateCommentSchema,
  createUserPredictionSchema,
  updateUserPredictionSchema,
  createLikeSchema,
  updateLikeSchema,
  authJwt
};
