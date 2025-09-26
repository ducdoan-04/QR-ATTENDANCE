import { useState } from "react";

interface ManualInputProps {
  onInput: (text: string) => void;
  onClose: () => void;
}

const ManualInput: React.FC<ManualInputProps> = ({ onInput, onClose }) => {
  const [mssv, setMssv] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mssv.trim()) {
      setError("Vui lòng nhập MSSV");
      return;
    }

    if (!/^\d+$/.test(mssv.trim())) {
      setError("MSSV chỉ được chứa số");
      return;
    }

    const qrText = `ATTEND:${mssv.trim()}`;
    onInput(qrText);
    onClose();
  };

  return (
    <div className="manual-input-overlay">
      <div className="manual-input-modal">
        <div className="manual-input-header">
          <h3>✏️ Nhập MSSV thủ công</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="manual-input-form">
          <div className="input-group">
            <label htmlFor="mssv">MSSV:</label>
            <input
              id="mssv"
              type="text"
              value={mssv}
              onChange={(e) => {
                setMssv(e.target.value);
                setError("");
              }}
              placeholder="Nhập MSSV (chỉ số)"
              maxLength={20}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Xác nhận
            </button>
          </div>
        </form>
        
        <div className="manual-input-info">
          <p><strong>Lưu ý:</strong></p>
          <ul>
            <li>MSSV chỉ được chứa số</li>
            <li>Đảm bảo MSSV chính xác</li>
            <li>Hệ thống sẽ tự động thêm tiền tố "ATTEND:"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManualInput; 