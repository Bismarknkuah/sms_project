# 🏫 St. Andrews School Management System (SMS)

A comprehensive school management system built with modern web technologies to streamline academic and administrative processes.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 👨‍💼 Administrative Features
- **Multi-branch Management** - Manage multiple school campuses
- **Role-based Access Control** - Secure access for different user types
- **User Management** - Comprehensive user registration and management
- **Dashboard Analytics** - Real-time insights and statistics

### 👨‍🎓 Academic Management
- **Student Registration** - Complete student enrollment system
- **Course Management** - Curriculum and subject management
- **Exam Management** - Assessment and grading system
- **Attendance Tracking** - Digital attendance management
- **Report Generation** - Academic reports and transcripts

### 💰 Financial Management
- **Fee Management** - Student fee collection and tracking
- **Payment Processing** - Multiple payment methods support
- **Financial Reports** - Comprehensive financial analytics
- **Budget Management** - School budget planning and monitoring

### 📚 Additional Modules
- **Library Management** - Book cataloging and lending system
- **Transport Management** - School bus and transport coordination
- **House System** - Student house management
- **Staff Management** - Employee records and HR functions

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Primary database
- **Redis** - Session storage and caching
- **JWT** - Authentication and authorization
- **Bcrypt** - Password hashing

### Frontend
- **HTML5/CSS3** - Modern web standards
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap/Tailwind** - Responsive design
- **Chart.js** - Data visualization

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancing
- **phpMyAdmin** - Database administration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Docker** (v20.10.0 or higher)
- **Docker Compose** (v2.0.0 or higher)
- **Git** (v2.30.0 or higher)

## 🚀 Installation

### Method 1: Docker Installation (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/standrews/sms.git
   cd st-andrews-sms
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Build and start with Docker**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

4. **Access the application**
   - Web Application: http://localhost
   - API Server: http://localhost:5000
   - Database Admin: http://localhost:8080
   - File Storage: http://localhost:9001

### Method 2: Manual Installation

1. **Clone and setup**
   ```bash
   git clone https://github.com/standrews/sms.git
   cd st-andrews-sms
   npm run setup:dev
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE st_andrews_sms;
   
   # Run migrations
   npm run migrate:db
   
   # Seed sample data
   npm run seed:db
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

## 🔧 Usage

### Default Login Credentials

After installation, use these credentials to access the system:

| Role | Username | Password | Branch |
|------|----------|----------|--------|
| Super Admin | `superadmin` | `password123` | All |
| Branch Admin | `admin.accra` | `password123` | Accra |
| Accountant | `accountant1` | `password123` | Main Campus |
| Student | `student001` | `password123` | Main Campus |

### Accessing Different Modules

1. **Login** at http://localhost/login.html
2. **Select your role** from the dropdown
3. **Choose branch** (if applicable)
4. **Enter credentials** and login
5. **Access your dashboard** based on your role

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/admin/auth/login
POST /api/admin/auth/logout
POST /api/admin/auth/reset-password
GET  /api/admin/auth/profile
```

### Core API Endpoints

```http
GET    /api/branches          # Get all branches
GET    /api/user-roles        # Get all user roles
GET    /api/health            # Health check
```

### Example API Usage

```javascript
// Login request
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'student',
    username: 'student001',
    password: 'password123',
    branchId: 'assin_fosu'
  })
});

const { token, user } = await response.json();
```

## 🐳 Docker Deployment

### Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment

```bash
# Build for production
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| sms-server | 5000 | Node.js Backend API |
| mysql | 3306 | MySQL Database |
| redis | 6379 | Redis Cache |
| nginx | 80/443 | Web Server |
| phpmyadmin | 8080 | Database Admin |
| minio | 9000/9001 | File Storage |

## 👥 User Roles

### Administrative Roles
- **Super Admin** - Full system access across all branches
- **Branch Admin** - Branch-specific administrative access
- **IT Admin** - Technical system administration

### Academic Staff
- **Headmaster** - Academic leadership and oversight
- **Staff/Teachers** - Classroom and academic management
- **Librarian** - Library system management

### Support Staff
- **Accountant** - Financial management and reporting
- **Transport Manager** - School transport coordination
- **House Master** - Student house system management
- **Security Officer** - Campus security management

### Students
- **Student** - Academic portal and personal information

### Community
- **PTA Chairman** - Parent-Teacher Association access

## 📁 Project Structure

```
st-andrews-sms/
├── client/                 # Frontend application
│   ├── public/            # Static files
│   └── src/               # Source code
│       └── pages/         # Dashboard pages
├── sms-server/            # Backend API server
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── database/             # Database files
│   ├── migrations/       # Database migrations
│   ├── seeds/           # Sample data
│   └── backups/         # Database backups
├── nginx/               # Nginx configuration
├── scripts/            # Utility scripts
├── docker-compose.yml  # Docker services
└── README.md          # Project documentation
```

## 🧪 Testing

```bash
# Run server tests
npm test

# Run client tests
npm run test:client

# Run all tests
npm run test:all
```

## 📊 Monitoring

```bash
# View application logs
npm run logs:server

# View database logs
npm run logs:db

# Monitor all services
npm run monitor
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **Rate Limiting** - Prevents brute force attacks
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - HTTP headers protection
- **Input Validation** - SQL injection prevention

## 🚀 Deployment

### Environment Variables

Create a `.env` file with these variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=sms_user
DB_PASSWORD=secure_password
DB_NAME=st_andrews_sms

# Security
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow JavaScript ES6+ standards
- Use meaningful commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **Email**: admin@standrews.edu.gh
- **Phone**: +233-XXX-XXXXXX
- **Website**: https://standrews.edu.gh

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added multi-branch support
- **v1.2.0** - Enhanced security and performance

## 🙏 Acknowledgments

- St. Andrews School Administration
- Development Team Contributors
- Open Source Community

---

**Made with ❤️ for St. Andrews School**