About The Project


This project is the robust backend for an Inventory Management Application, specifically designed to manage a catalog of games. It provides a secure, scalable, and well-structured API built with modern Node.js ecosystem tools, emphasizing clean architecture and best practices for full-stack development.

Features

- User Authentication: Secure user registration, login, logout, and password management using JWT (JSON Web Tokens).
- Access & Refresh Tokens: Implements the best practice for JWTs with short-lived access tokens and long-lived, rotating refresh tokens for enhanced security and user experience.
- Password Hashing: Passwords are securely stored using bcryptjs.
- Role-Based Authorization: Fine-grained access control differentiating between 'admin' and 'user' roles.
	- Admins can perform any operation (delete/update) on any game.
	- Regular users can only perform operations (delete/update) on games they own/created.
- Game Management (CRUD): Full Create, Read, Update, Delete operations for game entities.
- Image Uploads (File System Storage): Supports uploading game cover images, storing them efficiently on the server's file system (/uploads directory), rather than directly in the database.
- Dynamic Image Serving: Correctly serves uploaded images via a dedicated static file server endpoint, with dynamic URLs and cache-busting.
- Category Management: Endpoint to retrieve all available game categories.
- Robust Data Validation: Strict input validation using Zod schemas, seamlessly integrated via Express middleware.
- Centralized Error Handling: Custom error classes (AppError, BadRequestError, NotFoundError, etc.) with a global error-handling middleware for consistent and informative API responses.
- Logging: Integrated Morgan for HTTP request logging and Winston for comprehensive application-level logging, aiding debugging and monitoring.
- Clean Architecture (OOP): Controllers are organized into a class structure adhering to Object-Oriented Programming principles, promoting modularity and maintainability.
- Database: Powered by PostgreSQL with Prisma as the ORM for type-safe database interactions.

Technologies Used

- Runtime: Node.js, Bun
- Web Framework: Express.js
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Authentication: Passport.js (with passport-jwt strategy)
- File Uploads: express-fileupload
- Security: bcryptjs (password hashing), jsonwebtoken (JWTs), crypto (token generation)
- Validation: Zod
- Logging: Morgan, Winston
- Environment Variables: dotenv

check out frontend - <https://inventory-frontend-yjxe.vercel.app>

