import { useState } from "react";

interface QRGeneratorProps {
  onClose: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ onClose }) => {
  const [mssv, setMssv] = useState("12345678");
  const [qrText, setQrText] = useState("ATTEND:12345678");

  const generateQR = () => {
    const text = `ATTEND:${mssv}`;
    setQrText(text);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrText);
    alert("Đã copy mã QR vào clipboard!");
  };

  return (
    <div className="qr-generator-overlay">
      <div className="qr-generator-modal">
        <div className="qr-generator-header">
          <h3>🔧 QR Code Generator (for testing)</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="qr-generator-content">
          <div className="input-group">
            <label>MSSV:</label>
            <input
              type="text"
              value={mssv}
              onChange={(e) => setMssv(e.target.value)}
              placeholder="Nhập MSSV"
            />
            <button className="btn btn-primary" onClick={generateQR}>
              Tạo QR Code
            </button>
          </div>
          
          <div className="qr-display">
            <h4>QR Code Text:</h4>
            <div className="qr-text">
              <code>{qrText}</code>
              <button className="btn btn-secondary" onClick={copyToClipboard}>
                �� Copy
              </button>
            </div>
          </div>
          
          <div className="qr-instructions">
            <h4>Hướng dẫn test:</h4>
            <ol>
              <li>Nhập MSSV vào ô trên</li>
              <li>Click "Tạo QR Code"</li>
              <li>Copy text QR code</li>
              <li>Tạo QR code bằng ứng dụng khác (Google Lens, camera phone)</li>
              <li>Quét QR code đó bằng scanner</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator; 