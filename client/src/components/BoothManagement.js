import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './BoothManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BoothManagement = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBooth, setEditingBooth] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hasQuestions: false,
    questions: []
  });

  useEffect(() => {
    fetchBooths();
  }, []);

  const fetchBooths = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booths`);
      setBooths(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load booths');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', correctAnswer: '', options: [] }]
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = [...newQuestions[questionIndex].options, ''];
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooth) {
        await axios.put(`${API_BASE_URL}/booths/${editingBooth._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/booths`, formData);
      }
      
      setFormData({ name: '', description: '', hasQuestions: false, questions: [] });
      setShowForm(false);
      setEditingBooth(null);
      fetchBooths();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save booth');
    }
  };

  const handleEdit = (booth) => {
    setEditingBooth(booth);
    setFormData({
      name: booth.name,
      description: booth.description,
      hasQuestions: booth.hasQuestions,
      questions: booth.questions || []
    });
    setShowForm(true);
  };

  const handleDelete = async (boothId) => {
    if (window.confirm('Are you sure you want to delete this booth?')) {
      try {
        await axios.delete(`${API_BASE_URL}/booths/${boothId}`);
        fetchBooths();
      } catch (error) {
        setError('Failed to delete booth');
      }
    }
  };

  const generateQRCode = async (qrCode) => {
    setGeneratingQR(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/booths/${qrCode}/qr`);
      setQrCodeData(response.data);
      setShowQRModal(true);
    } catch (error) {
      setError('Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', hasQuestions: false, questions: [] });
    setShowForm(false);
    setEditingBooth(null);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQrCodeData(null);
  };

  if (loading) {
    return (
      <div className="booth-management">
        <div className="loading">Loading booths...</div>
      </div>
    );
  }

  return (
    <div className="booth-management">
      <div className="management-container">
        <div className="management-header">
          <h1>Booth Management</h1>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary"
          >
            Add New Booth
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError('')} className="btn btn-secondary">
              Dismiss
            </button>
          </div>
        )}

        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>{editingBooth ? 'Edit Booth' : 'Add New Booth'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="name">Booth Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="hasQuestions"
                      checked={formData.hasQuestions}
                      onChange={handleInputChange}
                    />
                    This booth has questions for attendees
                  </label>
                </div>

                {formData.hasQuestions && (
                  <div className="questions-section">
                    <h3>Questions</h3>
                    {formData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="question-item">
                        <div className="question-header">
                          <h4>Question {qIndex + 1}</h4>
                          <button 
                            type="button" 
                            onClick={() => removeQuestion(qIndex)}
                            className="btn btn-danger"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="input-group">
                          <label>Question Text *</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>Correct Answer *</label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                            required
                          />
                        </div>

                        <div className="options-section">
                          <label>Options (optional)</label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="option-input">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              <button 
                                type="button" 
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="btn btn-small btn-danger"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => addOption(qIndex)}
                            className="btn btn-small btn-secondary"
                          >
                            Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      onClick={addQuestion}
                      className="btn btn-secondary"
                    >
                      Add Question
                    </button>
                  </div>
                )}

                <div className="form-buttons">
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingBooth ? 'Update Booth' : 'Create Booth'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showQRModal && qrCodeData && (
          <div className="form-overlay">
            <div className="qr-modal">
              <h2>QR Code for {qrCodeData.boothId}</h2>
              <div className="qr-code-display">
                <img src={qrCodeData.qrCode} alt="QR Code" />
              </div>
              <div className="qr-info">
                <p><strong>QR Code:</strong> {qrCodeData.boothId}</p>
                <p>Scan this QR code to check-in to this booth</p>
              </div>
              <div className="qr-actions">
                <button onClick={closeQRModal} className="btn btn-secondary">
                  Close
                </button>
                <button 
                  onClick={() => window.open(qrCodeData.qrCode, '_blank')} 
                  className="btn btn-primary"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="booths-list">
          {booths.length === 0 ? (
            <div className="no-booths">
              <p>No booths created yet. Create your first booth!</p>
            </div>
          ) : (
            booths.map((booth) => (
              <div key={booth._id} className="booth-card">
                <div className="booth-info">
                  <h3>{booth.name}</h3>
                  <p>{booth.description}</p>
                  <div className="booth-meta">
                    <span className={`status ${booth.isActive ? 'active' : 'inactive'}`}>
                      {booth.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="qr-code">QR: {booth.qrCode.substring(0, 8)}...</span>
                    {booth.hasQuestions && (
                      <span className="questions-count">
                        {booth.questions.length} question(s)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="booth-actions">
                  <button 
                    onClick={() => generateQRCode(booth.qrCode)}
                    className="btn btn-primary"
                    disabled={generatingQR}
                  >
                    {generatingQR ? 'Generating...' : 'Generate QR'}
                  </button>
                  <button 
                    onClick={() => handleEdit(booth)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(booth._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BoothManagement; 