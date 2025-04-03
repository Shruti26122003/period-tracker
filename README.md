# Period Tracker App

A comprehensive period tracking application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (signup, login, profile management)
- Period tracking and cycle prediction
- Mood tracking with visualization
- Educational articles about menstrual health
- Mobile-responsive design

## Screenshots

![Dashboard Screenshot](https://your-screenshot-url.com)

## Tech Stack

- **Frontend**: React, React Router, Chart.js, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/period-tracker.git
   cd period-tracker
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm run server
   ```

2. Start the client:
   ```
   cd ../client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Running in Development Mode

To run both client and server concurrently:
```
cd server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/me` - Update user profile

### Periods
- `GET /api/periods` - Get all periods for the user
- `POST /api/periods` - Add a new period
- `GET /api/periods/:id` - Get specific period
- `PUT /api/periods/:id` - Update a period
- `DELETE /api/periods/:id` - Delete a period
- `GET /api/periods/stats/cycle` - Get cycle statistics

### Moods
- `GET /api/moods` - Get all moods for the user
- `POST /api/moods` - Add a new mood
- `GET /api/moods/:id` - Get specific mood
- `PUT /api/moods/:id` - Update a mood
- `DELETE /api/moods/:id` - Delete a mood
- `GET /api/moods/stats/monthly` - Get monthly mood statistics

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get specific article
- `POST /api/articles` - Add a new article (admin)
- `PUT /api/articles/:id` - Update an article (admin)
- `DELETE /api/articles/:id` - Delete an article (admin)
- `GET /api/articles/categories/all` - Get all article categories

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icon creators
- Design inspiration
- Open source libraries used 