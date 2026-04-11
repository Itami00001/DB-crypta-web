/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: ID пользователя
 *         username:
 *           type: string
 *           description: Имя пользователя
 *           minLength: 3
 *           maxLength: 30
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 *         password:
 *           type: string
 *           description: Пароль пользователя
 *           minLength: 6
 *         firstName:
 *           type: string
 *           description: Имя пользователя
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           description: Фамилия пользователя
 *           maxLength: 50
 *         phone:
 *           type: string
 *           description: Телефон пользователя
 *         coinBalance:
 *           type: number
 *           description: Баланс коинов пользователя
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     TopupRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Сумма пополнения в рублях
 *           minimum: 1
 *         paymentMethod:
 *           type: string
 *           description: Способ оплаты
 *           enum: [card, yandex, qiwi]
 */

const { verifyToken } = require("./../middleware/auth.middleware");
const controller = require("./../controllers/auth.controller.js");

module.exports = app => {
  // Регистрация пользователя
  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     summary: Регистрация нового пользователя
   *     tags: [Authentication]
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
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *               firstName:
   *                 type: string
   *                 maxLength: 50
   *               lastName:
   *                 type: string
   *                 maxLength: 50
   *               phone:
   *                 type: string
   *     responses:
   *       201:
   *         description: Пользователь успешно зарегистрирован
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Пользователь уже существует
   */
  app.post("/api/auth/signup", controller.signup);

  // Вход пользователя
  /**
   * @swagger
   * /api/auth/signin:
   *   post:
   *     summary: Вход пользователя
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Вход выполнен успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Неверные учетные данные
   */
  app.post("/api/auth/signin", controller.signin);

  // Получение текущего пользователя
  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Получение данных текущего пользователя
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Данные пользователя получены
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Неавторизованный доступ
   */
  app.get("/api/auth/me", [verifyToken], controller.getCurrentUser);

  // Пополнение баланса
  /**
   * @swagger
   * /api/auth/topup:
   *   post:
   *     summary: Пополнение баланса коинов
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TopupRequest'
   *     responses:
   *       200:
   *         description: Баланс успешно пополнен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 amount:
   *                   type: number
   *                 newBalance:
   *                   type: number
   *       400:
   *         description: Неверная сумма пополнения
   *       401:
   *         description: Неавторизованный доступ
   */
  app.post("/api/auth/topup", [verifyToken], controller.topupBalance);
};
