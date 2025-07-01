import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QRScanner.css';

const QRScanner = () => {
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleQRCodeChange = (e) => {
    setQrCode(e.target.value);
  };

  const handleScan = () => {
    if (qrCode.trim()) {
      navigate(`/checkin/${qrCode.trim()}`);
    }
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    handleScan();
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-container">
        <h2>Scan QR Code</h2>
        <p>Point your camera at a booth's QR code or enter the code manually</p>
        
        <div className="scanner-section">
          <div className="camera-placeholder">
            <div className="camera-icon">📷</div>
            <p>Camera access not available in this demo</p>
            <p>Please enter QR code manually below</p>
          </div>
        </div>

        <form onSubmit={handleManualInput} className="manual-input">
          <div className="input-group">
            <label htmlFor="qrCode">QR Code:</label>
            <input
              type="text"
              id="qrCode"
              value={qrCode}
              onChange={handleQRCodeChange}
              placeholder="Enter QR code here..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Continue to Check-in
          </button>
        </form>

        <div className="demo-codes">
          <h3>Demo QR Codes (for testing):</h3>
          <div className="demo-buttons">
            <button 
              className="demo-btn"
              onClick={() => setQrCode('demo-booth-1')}
            >
              Demo Booth 1
            </button>
            <button 
              className="demo-btn"
              onClick={() => setQrCode('demo-booth-2')}
            >
              Demo Booth 2
            </button>
            <button 
              className="demo-btn"
              onClick={() => setQrCode('demo-booth-3')}
            >
              Demo Booth 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 