# API Test Suite

This directory contains comprehensive functional tests for the Digital Event Passport API.

## Test Structure

The test suite is organized into the following sections:

### 1. Basic API Tests
- Root endpoint response
- API health check

### 2. Booth API Tests
- **POST /api/booths** - Create booths (with/without questions)
- **GET /api/booths** - Get all active booths
- **GET /api/booths/qr/:qrCode** - Get booth by QR code
- **PUT /api/booths/:id** - Update booth information
- **DELETE /api/booths/:id** - Soft delete booth

### 3. Attendee API Tests
- **POST /api/attendees** - Create attendees
- **GET /api/attendees** - Get all attendees
- **GET /api/attendees/email/:email** - Get attendee by email
- **GET /api/attendees/:id/visits** - Get attendee visit history

### 4. Visit API Tests
- **POST /api/visits/checkin** - Check in to booths
- **POST /api/visits/:visitId/rate** - Rate booth visits
- **GET /api/visits/stats** - Get visit statistics
- **GET /api/visits** - Get all visits
- **GET /api/visits/attendee/:attendeeId** - Get visit history

### 5. Error Handling Tests
- Invalid JSON handling
- Non-existent routes
- Validation errors

## Test Database

Tests use a separate test database: `digital-event-passport-test`

- Database is created fresh for each test run
- Collections are cleaned between individual tests
- No interference with production data

## Running Tests

### Prerequisites
1. MongoDB must be running on `localhost:27017`
2. All dependencies installed: `npm install`

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- tests/api.test.js
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Test Coverage

The test suite covers:

- ✅ All CRUD operations for booths
- ✅ Attendee registration and retrieval
- ✅ Booth check-in process
- ✅ Question/answer functionality
- ✅ Rating system
- ✅ Statistics and analytics
- ✅ Error handling and validation
- ✅ Edge cases and invalid inputs

## Test Data

Tests create sample data including:
- Test booths with and without questions
- Sample attendees
- Visit records with ratings
- Various scenarios for validation

## Expected Results

When all tests pass, you should see:
- All test cases passing (green)
- Coverage report showing high coverage
- No database pollution in production
- Clean test environment

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in setup.js

2. **Test Timeout**
   - Increase timeout in jest.config.js if needed
   - Check for hanging connections

3. **Database Cleanup Issues**
   - Ensure test database is separate from production
   - Check MongoDB permissions

### Debug Mode:
```bash
npm test -- --verbose
```

## Adding New Tests

When adding new API endpoints:

1. Add test cases to the appropriate describe block
2. Follow the existing pattern for setup/teardown
3. Test both success and error scenarios
4. Update this README if needed 