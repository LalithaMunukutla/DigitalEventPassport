const request = require('supertest');
const app = require('../server');

describe('Digital Event Passport API Tests', () => {
  describe('Basic API', () => {
    it('should return API message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Digital Event Passport API');
    });
  });

  describe('Booth API', () => {
    it('should create a new booth successfully', async () => {
      const boothData = {
        name: 'Test Booth',
        description: 'A test booth for testing purposes',
        isActive: true
      };
      const res = await request(app)
        .post('/api/booths')
        .send(boothData);
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(boothData.name);
      expect(res.body.description).toBe(boothData.description);
      expect(res.body.isActive).toBe(true);
      expect(res.body.qrCode).toBeDefined();
      expect(res.body._id).toBeDefined();
    });

    it('should create a booth with questions', async () => {
      const boothData = {
        name: 'Quiz Booth',
        description: 'A booth with questions',
        isActive: true,
        hasQuestions: true,
        questions: [
          {
            question: 'What is 2+2?',
            correctAnswer: '4',
            options: ['2', '3', '4', '5']
          }
        ]
      };
      const res = await request(app)
        .post('/api/booths')
        .send(boothData);
      expect(res.statusCode).toBe(201);
      expect(res.body.hasQuestions).toBe(true);
      expect(res.body.questions).toHaveLength(1);
      expect(res.body.questions[0].question).toBe('What is 2+2?');
    });

    it('should return 400 for invalid booth data', async () => {
      const invalidData = { description: 'Missing name' };
      const res = await request(app)
        .post('/api/booths')
        .send(invalidData);
      expect(res.statusCode).toBe(400);
    });

    it('should get all active booths', async () => {
      // Create a booth first
      await request(app).post('/api/booths').send({ name: 'Active Booth', description: 'desc', isActive: true });
      const res = await request(app).get('/api/booths');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get booth by QR code', async () => {
      const boothRes = await request(app).post('/api/booths').send({ name: 'QR Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const res = await request(app).get(`/api/booths/qr/${booth.qrCode}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(booth._id);
      expect(res.body.name).toBe(booth.name);
    });

    it('should return 404 for invalid QR code', async () => {
      const res = await request(app).get('/api/booths/qr/invalid-qr-code');
      expect(res.statusCode).toBe(404);
    });

    it('should update booth successfully', async () => {
      const boothRes = await request(app).post('/api/booths').send({ name: 'Update Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const updateData = { name: 'Updated Booth', description: 'Updated desc' };
      const res = await request(app).put(`/api/booths/${booth._id}`).send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent booth', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).put(`/api/booths/${fakeId}`).send({ name: 'Test' });
      expect(res.statusCode).toBe(404);
    });

    it('should soft delete booth', async () => {
      const boothRes = await request(app).post('/api/booths').send({ name: 'Delete Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const res = await request(app).delete(`/api/booths/${booth._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.isActive).toBe(false);
    });
  });

  describe('Attendee API', () => {
    it('should create a new attendee successfully', async () => {
      const attendeeData = { name: 'John Doe', email: 'john@example.com', phoneNumber: '1234567890' };
      const res = await request(app).post('/api/attendees').send(attendeeData);
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(attendeeData.name);
      expect(res.body.email).toBe(attendeeData.email.toLowerCase());
      expect(res.body.phoneNumber).toBe(attendeeData.phoneNumber);
      expect(res.body.totalVisits).toBe(0);
      expect(res.body._id).toBeDefined();
    });

    it('should return 400 for invalid attendee data', async () => {
      const invalidData = { name: 'Test' };
      const res = await request(app).post('/api/attendees').send(invalidData);
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for duplicate email', async () => {
      const attendeeData = { name: 'Jane Doe', email: 'jane@example.com', phoneNumber: '0987654321' };
      await request(app).post('/api/attendees').send(attendeeData);
      const res = await request(app).post('/api/attendees').send(attendeeData);
      expect(res.statusCode).toBe(400);
    });

    it('should get all attendees', async () => {
      await request(app).post('/api/attendees').send({ name: 'A', email: 'a@a.com', phoneNumber: '1' });
      const res = await request(app).get('/api/attendees');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get attendee by email', async () => {
      const attendeeData = { name: 'Email User', email: 'emailuser@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const res = await request(app).get(`/api/attendees/email/${attendeeData.email}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(attendeeData.name);
    });

    it('should return 404 for non-existent email', async () => {
      const res = await request(app).get('/api/attendees/email/nonexistent@example.com');
      expect(res.statusCode).toBe(404);
    });

    it('should get attendee visit history', async () => {
      const attendeeData = { name: 'Visit User', email: 'visituser@example.com', phoneNumber: '123' };
      const attendeeRes = await request(app).post('/api/attendees').send(attendeeData);
      const attendee = attendeeRes.body;
      const res = await request(app).get(`/api/attendees/${attendee._id}/visits`);
      expect(res.statusCode).toBe(200);
      expect(res.body.attendee._id).toBe(attendee._id);
      expect(Array.isArray(res.body.visits)).toBe(true);
    });
  });

  describe('Visit API', () => {
    it('should check in to booth successfully', async () => {
      const boothRes = await request(app).post('/api/booths').send({ name: 'Checkin Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const attendeeData = { name: 'Checkin User', email: 'checkin@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: booth.qrCode, attendeeData };
      const res = await request(app).post('/api/visits/checkin').send(checkinData);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.visit).toBeDefined();
      expect(res.body.attendee).toBeDefined();
      expect(res.body.booth).toBeDefined();
      expect(res.body.visit.isVisited).toBe(true);
    });

    it('should check in with questions and answers', async () => {
      const quizBoothData = {
        name: 'Quiz Booth',
        description: 'Test quiz booth',
        isActive: true,
        hasQuestions: true,
        questions: [
          {
            question: 'What is 2+2?',
            correctAnswer: '4',
            options: ['2', '3', '4', '5']
          }
        ]
      };
      const quizBoothRes = await request(app).post('/api/booths').send(quizBoothData);
      const quizBooth = quizBoothRes.body;
      const attendeeData = { name: 'Quiz User', email: 'quiz@example.com', phoneNumber: '5555555555' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: quizBooth.qrCode, attendeeData, answers: ['4'] };
      const res = await request(app).post('/api/visits/checkin').send(checkinData);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.visit.score).toBe(100);
      expect(res.body.visit.isVisited).toBe(true);
    });

    it('should return 404 for invalid QR code', async () => {
      const attendeeData = { name: 'Invalid QR', email: 'invalidqr@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: 'invalid-qr-code', attendeeData };
      const res = await request(app).post('/api/visits/checkin').send(checkinData);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Booth not found');
    });

    it('should return 400 for missing answers when booth has questions', async () => {
      const requiredQuizBoothData = {
        name: 'Required Quiz Booth',
        description: 'Booth requiring answers',
        isActive: true,
        hasQuestions: true,
        questions: [
          {
            question: 'What is 2+2?',
            correctAnswer: '4',
            options: ['2', '3', '4', '5']
          }
        ]
      };
      const requiredQuizBoothRes = await request(app).post('/api/booths').send(requiredQuizBoothData);
      const requiredQuizBooth = requiredQuizBoothRes.body;
      const attendeeData = { name: 'Test User', email: 'test2@example.com', phoneNumber: '1234567890' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: requiredQuizBooth.qrCode, attendeeData };
      const res = await request(app).post('/api/visits/checkin').send(checkinData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Answers are required for this booth');
    });

    it('should rate a booth visit successfully', async () => {
      // Setup: create booth, attendee, checkin
      const boothRes = await request(app).post('/api/booths').send({ name: 'Rate Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const attendeeData = { name: 'Rate User', email: 'rate@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: booth.qrCode, attendeeData };
      const checkinRes = await request(app).post('/api/visits/checkin').send(checkinData);
      const visit = checkinRes.body.visit;
      const ratingData = { rating: 5, comment: 'Excellent booth experience!' };
      const res = await request(app).post(`/api/visits/${visit._id}/rate`).send(ratingData);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.visit.rating).toBe(5);
      expect(res.body.visit.ratingComment).toBe(ratingData.comment);
    });

    it('should return 400 for invalid rating', async () => {
      // Setup: create booth, attendee, checkin
      const boothRes = await request(app).post('/api/booths').send({ name: 'Invalid Rating Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const attendeeData = { name: 'Invalid Rating User', email: 'invalidrating@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: booth.qrCode, attendeeData };
      const checkinRes = await request(app).post('/api/visits/checkin').send(checkinData);
      const visit = checkinRes.body.visit;
      const invalidRating = { rating: 6, comment: 'Test comment' };
      const res = await request(app).post(`/api/visits/${visit._id}/rate`).send(invalidRating);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Rating must be between 1 and 5');
    });

    it('should return 404 for non-existent visit', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).post(`/api/visits/${fakeId}/rate`).send({ rating: 5 });
      expect(res.statusCode).toBe(404);
    });

    it('should get visit statistics', async () => {
      // Setup: create booth, attendee, checkin, rate
      const boothRes = await request(app).post('/api/booths').send({ name: 'Stats Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const attendeeData = { name: 'Stats User', email: 'stats@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: booth.qrCode, attendeeData };
      const checkinRes = await request(app).post('/api/visits/checkin').send(checkinData);
      const visit = checkinRes.body.visit;
      await request(app).post(`/api/visits/${visit._id}/rate`).send({ rating: 4 });
      const res = await request(app).get('/api/visits/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.totalVisits).toBeGreaterThanOrEqual(1);
      expect(res.body.totalAttendees).toBeGreaterThanOrEqual(1);
      expect(res.body.totalBooths).toBeGreaterThanOrEqual(1);
      expect(res.body.ratingAnalytics).toBeDefined();
      expect(res.body.ratingAnalytics.totalRatings).toBeGreaterThanOrEqual(0);
      expect(res.body.ratingAnalytics.averageRating).toBeGreaterThanOrEqual(0);
    });

    it('should get all visits', async () => {
      // Setup: create booth, attendee, checkin
      const boothRes = await request(app).post('/api/booths').send({ name: 'All Visits Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const attendeeData = { name: 'All Visits User', email: 'allvisits@example.com', phoneNumber: '123' };
      await request(app).post('/api/attendees').send(attendeeData);
      const checkinData = { boothQrCode: booth.qrCode, attendeeData };
      await request(app).post('/api/visits/checkin').send(checkinData);
      const res = await request(app).get('/api/visits');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get visit history for attendee', async () => {
      // Setup: create booth, attendee, checkin
      const boothRes = await request(app).post('/api/booths').send({ name: 'History Booth', description: 'desc', isActive: true });
      const booth = boothRes.body;
      const attendeeData = { name: 'History User', email: 'history@example.com', phoneNumber: '123' };
      const attendeeRes = await request(app).post('/api/attendees').send(attendeeData);
      const attendee = attendeeRes.body;
      const checkinData = { boothQrCode: booth.qrCode, attendeeData };
      await request(app).post('/api/visits/checkin').send(checkinData);
      const res = await request(app).get(`/api/visits/attendee/${attendee._id}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const res = await request(app)
        .post('/api/booths')
        .set('Content-Type', 'application/json')
        .send('invalid json');
      expect(res.statusCode).toBe(400);
    });

    it('should handle non-existent routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
}); 