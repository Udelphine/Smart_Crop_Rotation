# 🌱 Smart Crop Rotation Management System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express.js](https://img.shields.io/badge/Express.js-5.x-blue)
![SQLite](https://img.shields.io/badge/SQLite-3.x-lightgrey)
![Jest](https://img.shields.io/badge/Jest-30.x-red)
![Docker](https://img.shields.io/badge/Docker-✓-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**An intelligent crop rotation planning system for sustainable agriculture**

</div>

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Docker Deployment](#-docker-deployment)
- [Design Patterns](#-design-patterns)
- [Project Structure](#-project-structure)
- [Requirements Met](#-requirements-met)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

The **Smart Crop Rotation Management System** is a comprehensive web application designed to help farmers and agricultural experts plan optimal crop rotations. By implementing various scientific strategies, the system improves soil health, maximizes crop yield, and manages pests effectively.

### 🎓 **Academic Context**
This project was developed as a **Final Exam Project** for Software Engineering, demonstrating proficiency in:
- Software Design Principles
- Design Patterns Implementation
- Clean Code Practices
- Testing Strategies
- Containerization
- Version Control

## ✨ Features

### 🔄 **Rotation Strategies**
- **Nutrient-Based Strategy**: Balances soil nutrients through intelligent crop sequencing
- **Pest Management Strategy**: Breaks pest and disease cycles through crop diversity
- **Seasonal Strategy**: Matches crops to seasonal conditions and climate

### 🔧 **Technical Features**
- **RESTful API**: Complete CRUD operations with proper HTTP methods
- **Authentication & Authorization**: JWT-based security with role-based access
- **SQLite Database**: File-based, zero-configuration database
- **Strategy Design Pattern**: Extensible architecture for new algorithms
- **Comprehensive Testing**: Unit, integration, and API tests
- **Docker Containerization**: Easy deployment with Docker and Docker Compose
- **Code Quality**: ESLint + Prettier following Google JavaScript standards

## 🏗️ System Architecture

### High-Level Architecture

┌─────────────────┐ HTTP/REST ┌─────────────────┐ Database ┌─────────────────┐
│ Client │ ◄─────────────► │ Express API │ ◄────────────► │ SQLite DB │
│ (Browser/ │ │ (Node.js) │ │ (File-based) │
│ Mobile App) │ └─────────────────┘ └─────────────────┘
└─────────────────┘ │ │
┌──────▼──────┐ ┌──────▼──────┐
│ Business │ │ Strategy │
│ Logic │ │ Pattern │
│ (Services) │ │ (Algorithms)│
└──────────────┘ └──────────────┘

### Design Pattern: Strategy Pattern
The system implements the **Strategy Design Pattern** for crop rotation algorithms:

```javascript
// Three concrete strategies implemented
1. NutrientBasedStrategy - Analyzes soil nutrients and recommends crops
2. PestManagementStrategy - Focuses on breaking pest cycles
3. SeasonalStrategy - Considers seasonal suitability and climate