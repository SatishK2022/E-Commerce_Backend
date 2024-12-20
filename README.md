# E-Commerce Backend SQL

## Project Overview

This project is an e-commerce backend system built using SQL. It manages the database operations for an online store, including product management, user management, order processing, and more.

## Features

- Product Management: Add, update, delete, and view products.
- User Management: Register, update, delete, and view user profiles.
- Order Processing: Create, update, and view orders.
- Inventory Management: Track product stock levels.

## Technologies Used

- SQL
- Database Management System (DBMS) (MySQL)
- Backend Framework (Node.js, Express) for API endpoints

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SatishK2022/E-Commerce_Backend.git
   ```
2. Navigate to the project directory:

   ```bash
   cd E-Commerce_Backend
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:

   ```bash
    PORT=<your-port>

    JWT_SECRET=<your-jwt-secret>
    JWT_EXPIRY=<your-jwt-expiry>

    SMTP_FROM_EMAIL=<your-email>
    SMTP_HOST=<your-smtp-host>
    SMTP_PORT=<your-smtp-port>
    SMTP_USER=<your-smtp-user>
    SMTP_PASS=<your-smtp-pass>
   ```

## Usage

1. Start the backend server:
   ```bash
   npm run dev
   ```
2. Use an API client (Postman) to interact with the backend endpoints.

## API Endpoints

### User Routes
- **POST /register** - Register a new user
- **POST /login** - User login
- **GET /logout** - User logout
- **GET /profile** - Get user profile (requires login)
- **PUT /update-profile** - Update user profile (requires login)
- **POST /forgot-password** - Forgot password
- **POST /verify-otp** - Verify OTP
- **POST /reset-password** - Reset password

### Product Routes
- **POST /** - Add a new product (requires admin login)
- **GET /** - Get all products
- **PUT /:id** - Update a product (requires admin login)
- **DELETE /:id** - Delete a product (requires admin login)
- **GET /:id** - Get a product by ID
- **GET /category/:id** - Get products by category

### Order Routes
- **POST /** - Create a new order (requires login)
- **GET /** - Get all orders (requires admin login)
- **GET /me** - Get orders for the logged-in user
- **PATCH /:id** - Update an order (requires admin login)

### Category Routes
- **POST /** - Create a new category (requires admin login)
- **GET /** - Get all categories
- **PUT /:id** - Update a category (requires admin login)
- **DELETE /:id** - Delete a category (requires admin login)
- **GET /:id** - Get a category by ID

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-branch
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-branch
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License.
