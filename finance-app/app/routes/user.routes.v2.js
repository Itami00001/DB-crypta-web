module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const { validate, createUserSchema, updateUserSchema } = require("../middleware/validation");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: Users
   *   description: User management and authentication
   */

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 30
   *                 pattern: '^[a-zA-Z0-9]+$'
   *                 example: john_doe
   *                 description: Username (alphanumeric only)
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@example.com
   *                 description: User email address
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: SecurePass123
   *                 description: User password (will be hashed)
   *               firstName:
   *                 type: string
   *                 maxLength: 50
   *                 example: John
   *                 description: User first name
   *               lastName:
   *                 type: string
   *                 maxLength: 50
   *                 example: Doe
   *                 description: User last name
   *               phone:
   *                 type: string
   *                 pattern: '^[+]?[\\d\\s\\-()]+$'
   *                 example: +1234567890
   *                 description: User phone number
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       409:
   *         description: Username or email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/", validate(createUserSchema), users.create);

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Retrieve all users
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/", users.findAll);

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Retrieve a single user by id
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User unique identifier
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only access own profile or admin required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/:id", users.findOne);

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update a user by id
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User unique identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 30
   *                 pattern: '^[a-zA-Z0-9]+$'
   *                 example: john_doe_updated
   *                 description: Updated username
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john.updated@example.com
   *                 description: Updated email address
   *               firstName:
   *                 type: string
   *                 maxLength: 50
   *                 example: John
   *                 description: Updated first name
   *               lastName:
   *                 type: string
   *                 maxLength: 50
   *                 example: Doe
   *                 description: Updated last name
   *               phone:
   *                 type: string
   *                 pattern: '^[+]?[\\d\\s\\-()]+$'
   *                 example: +1234567890
   *                 description: Updated phone number
   *               isVerified:
   *                 type: boolean
   *                 example: true
   *                 description: Updated verification status
   *               isAdmin:
   *                 type: boolean
   *                 example: false
   *                 description: Updated admin status
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only update own profile or admin required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Username or email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put("/:id", validate(updateUserSchema), users.update);

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete a user by id
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User unique identifier
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: User was deleted successfully!
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only delete own account or admin required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete("/:id", users.delete);

  /**
   * @swagger
   * /api/users:
   *   delete:
   *     summary: Delete all users (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: All users deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "15 Users were deleted successfully!"
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete("/", users.deleteAll);

  /**
   * @swagger
   * /api/users/{id}/topup:
   *   post:
   *     summary: Top up user balance (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User unique identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currency
   *               - amount
   *             properties:
   *               currency:
   *                 type: string
   *                 enum: [COIN, USD, RUB, BTC]
   *                 example: USD
   *                 description: Currency to top up
   *               amount:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 example: 100.00
   *                 description: Amount to add (must be positive)
   *     responses:
   *       200:
   *         description: Balance topped up successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Balance topped up successfully
   *                 newBalance:
   *                   type: number
   *                   format: decimal
   *                   example: 1100.00
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/:id/topup", users.adminTopup);

  app.use('/api/users', router);
};
