# Finance App - Financial Accounting with Cryptocurrency Support

## Description

Finance App is a comprehensive financial accounting system with cryptocurrency support. It allows users to manage their finances, track cryptocurrency portfolios, publish financial news and predictions, and interact with a community of financial enthusiasts.

## Features

- **User Management**: Registration, authentication, and profile management
- **Cryptocurrency Wallets**: Multiple wallet support with balance tracking
- **Transaction Management**: Complete transaction history with different types (buy, sell, transfer, etc.)
- **News Feed**: Publish and read financial news, predictions, and analysis
- **Comments System**: Interactive commenting with nested replies
- **User Predictions**: Share and track cryptocurrency price predictions
- **Like System**: Engage with content through likes and reactions
- **Cryptocurrency Tracking**: Real-time cryptocurrency information and market data

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Containerization**: Docker, Docker Compose
- **API Documentation**: Swagger/OpenAPI 3.0
- **Environment**: dotenv for configuration management

## Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **CryptoWallets**: Cryptocurrency wallets with balance tracking
- **Transactions**: Financial transactions between wallets
- **NewsPosts**: News articles, predictions, and analysis
- **Comments**: User comments on posts with nested replies
- **CryptoCurrencies**: Cryptocurrency information and market data
- **UserPredictions**: User price predictions
- **Likes**: User reactions to posts

## Installation

### Prerequisites

- Docker and Docker Compose installed
- Git for version control

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-project
```

2. Copy environment file:
```bash
cp .env.sample .env
```

3. Start the application using Docker Compose:
```bash
docker-compose up -d --build
```

The application will be available at:
- API: http://localhost:6868
- Swagger Documentation: http://localhost:6868/api-docs
- PostgreSQL: localhost:5433

## API Documentation

Once the application is running, you can access the interactive API documentation at:
```
http://localhost:6868/api-docs
```

### Main API Endpoints

- **Users**: `/api/users`
- **News Posts**: `/api/news-posts`
- **Crypto Wallets**: `/api/crypto-wallets`
- **Transactions**: `/api/transactions`
- **Comments**: `/api/comments`
- **Predictions**: `/api/user-predictions`

## Usage Examples

### Create a new user
```bash
curl -X POST http://localhost:6868/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "passwordHash": "hashed_password",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create a news post
```bash
curl -X POST http://localhost:6868/api/news-posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bitcoin Price Analysis",
    "content": "Detailed analysis of Bitcoin price movements...",
    "postType": "analysis",
    "category": "cryptocurrency",
    "authorId": "user-id-here",
    "isPublished": true
  }'
```

## Database Connection

You can connect to the PostgreSQL database using:
- **Host**: localhost
- **Port**: 5433
- **Database**: finance_app_db
- **Username**: postgres
- **Password**: 123456

## Development

### Project Structure

```
finance-project/
finance-app/
  app/
    config/
      db.config.js
    controllers/
      user.controller.js
      news-post.controller.js
      # ... other controllers
    models/
      user.model.js
      news-post.model.js
      # ... other models
      associations.js
      index.js
    routes/
      user.routes.js
      news-post.routes.js
      # ... other routes
  .env.sample
  Dockerfile
  package.json
  server.js
docker-compose.yml
.env
README.md
```

### Adding New Models

1. Create model file in `app/models/`
2. Register model in `app/models/index.js`
3. Add associations in `app/models/associations.js`
4. Create controller in `app/controllers/`
5. Create routes in `app/routes/`
6. Register routes in `server.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Contact

For questions and support, please contact the project maintainer.

## Acknowledgments

- Built following the laboratory work guidelines
- Uses Sequelize ORM for database operations
- Implements RESTful API design principles
- Follows Docker best practices for containerization
