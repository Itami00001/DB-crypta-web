/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - passwordHash
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of user
 *         username:
 *           type: string
 *           description: The username of the user
 *           minLength: 3
 *           maxLength: 30
 *           pattern: '^[a-zA-Z0-9]+$'
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         passwordHash:
 *           type: string
 *           description: The hashed password of the user
 *           minLength: 6
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *           maxLength: 50
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *           pattern: '^[+]?[\\d\\s\\-()]+$'
 *         isVerified:
 *           type: boolean
 *           description: Whether the user is verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The update date
 */

module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const { validate, createUserSchema, updateUserSchema } = require("../middleware/validation");
  var router = require("express").Router();

  // Create a new User
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
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       200:
   *         description: The user was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request - validation error
   */
  router.post("/", validate(createUserSchema), users.create);

  // Retrieve all Users
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Retrieve all users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of all users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  router.get("/", users.findAll);

  // Retrieve a single User with id
  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Retrieve a single user by id
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */
  router.get("/:id", users.findOne);

  // Update a User with id
  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update a user by id
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Bad request - validation error
   *       404:
   *         description: User not found
   */
  router.put("/:id", validate(updateUserSchema), users.update);

  // Delete a User with id
  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete a user by id
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  router.delete("/:id", users.delete);

  // Delete all Users
  /**
   * @swagger
   * /api/users:
   *   delete:
   *     summary: Delete all users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: All users deleted successfully
   */
  router.delete("/", users.deleteAll);

  app.use('/api/users', router);
};
