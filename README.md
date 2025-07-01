# Digital Event Passport

A full-stack web application for managing event booths and attendee check-ins using QR codes. Attendees can scan QR codes at booths, provide their information, and answer questions to complete their digital passport.

## Features

- **QR Code Scanning**: Attendees can scan booth QR codes to check-in
- **Attendee Registration**: Collect attendee information (name, email, phone)
- **Question System**: Optional questions for booths to test attendee knowledge
- **Digital Passport**: Track attendee progress and visit history
- **Admin Dashboard**: Manage booths, view statistics, and monitor event progress
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication (future enhancement)
- **QR Code** generation and validation
- **CORS** enabled for cross-origin requests

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with modern styling and responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd DigitalEventPassport
```

### 2. Install backend dependencies
```bash
cd server
npm install
```

### 3. Install frontend dependencies
```bash
cd ../client
npm install
```

### 4. Set up environment variables
Create a `config.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-event-passport
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 5. Start MongoDB
Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in the config file.

## Running the Application

### Start the backend server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

### Start the frontend application
```bash
cd client
npm start
```
The React app will start on `http://localhost:3000`

## API Endpoints

### Booths
- `GET /api/booths` - Get all active booths
- `GET /api/booths/qr/:qrCode` - Get booth by QR code
- `POST /api/booths` - Create new booth
- `PUT /api/booths/:id` - Update booth
- `DELETE /api/booths/:id` - Delete booth (soft delete)
- `GET /api/booths/:id/qr` - Generate QR code for booth

### Attendees
- `GET /api/attendees` - Get all attendees
- `GET /api/attendees/email/:email` - Get attendee by email
- `GET /api/attendees/:id/visits` - Get attendee visit history
- `POST /api/attendees` - Create new attendee
- `PUT /api/attendees/:id` - Update attendee
- `GET /api/attendees/:id/stats` - Get attendee statistics

### Visits
- `POST /api/visits/checkin` - Check-in to booth
- `GET /api/visits/attendee/:attendeeId` - Get visit history for attendee
- `GET /api/visits` - Get all visits (admin)
- `GET /api/visits/stats` - Get visit statistics

## Usage Guide

### For Event Organizers (Admin)

1. **Access Admin Panel**: Navigate to `/admin` in the application
2. **Create Booths**: Use the "Add New Booth" button to create booths
3. **Configure Questions**: Optionally add questions for each booth
4. **Generate QR Codes**: Each booth gets a unique QR code automatically
5. **Monitor Progress**: View real-time statistics and attendee progress

### For Attendees

1. **Scan QR Code**: Use the QR scanner or enter the code manually
2. **Provide Information**: Enter name, email, and phone number
3. **Answer Questions**: If the booth has questions, answer them to complete the visit
4. **View Passport**: Check your profile to see visit history and progress

## Demo Data

For testing purposes, you can use these demo QR codes:
- `demo-booth-1`
- `demo-booth-2`
- `demo-booth-3`

## Project Structure

```
DigitalEventPassport/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # React components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   ├── config.env         # Environment variables
│   └── package.json
└── README.md
```

## Database Schema

### Booth
- `name`: String (required)
- `description`: String (required)
- `qrCode`: String (unique, auto-generated)
- `hasQuestions`: Boolean (default: false)
- `questions`: Array of question objects
- `isActive`: Boolean (default: true)
- `createdAt`: Date

### Attendee
- `name`: String (required)
- `email`: String (required, unique)
- `phoneNumber`: String (required)
- `totalVisits`: Number (default: 0)
- `createdAt`: Date

### Visit
- `attendee`: ObjectId (ref: Attendee)
- `booth`: ObjectId (ref: Booth)
- `isVisited`: Boolean (default: false)
- `answers`: Array of answer objects
- `score`: Number (default: 0)
- `visitedAt`: Date

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Email confirmations
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Offline support
- [ ] Multi-language support
- [ ] Custom branding options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team. 