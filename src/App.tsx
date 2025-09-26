import { useState, useEffect } from "react";
import QRScanner from "./QRScanner";
import { Preferences } from "@capacitor/preferences";
import { exportCSV } from "./utils/exportCSV";
import "./App.css";

// Define the attendance record type
interface AttendanceRecord {
  mssv: string;
  time: string;
  date: string;
}

function App() {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [filter, setFilter] = useState<string>("");

  // Load lịch sử khi mở app
  useEffect(() => {
    (async () => {
      try {
        const { value } = await Preferences.get({ key: "attendance" });
        if (value) setHistory(JSON.parse(value));
      } catch (error) {
        console.error("Error loading attendance history:", error);
      }
    })();
  }, []);

  // Auto clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Show message helper
  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
  };

  // Lưu vào Preferences
  const saveHistory = async (newHistory: AttendanceRecord[]) => {
    try {
      setHistory(newHistory);
      await Preferences.set({
        key: "attendance",
        value: JSON.stringify(newHistory),
      });
    } catch (error) {
      console.error("Error saving attendance history:", error);
      showMessage("Lỗi lưu dữ liệu!", "error");
    }
  };

  // Xử lý khi quét QR
  const handleScan = (text: string) => {
    if (text.startsWith("ATTEND:")) {
      const mssv = text.replace("ATTEND:", "").trim();
      
      // Check if MSSV already exists today
      const today = new Date().toLocaleDateString();
      const existingToday = history.find(h => h.mssv === mssv && h.date === today);
      
      if (existingToday) {
        showMessage(`MSSV ${mssv} đã điểm danh hôm nay!`, "error");
        setScanning(false);
        return;
      }

      const now = new Date();
      const record: AttendanceRecord = {
        mssv,
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
      };
      
      const newHistory = [record, ...history];
      saveHistory(newHistory);
      setScanning(false);
      showMessage(`Điểm danh thành công: ${mssv}`, "success");
    } else {
      showMessage("QR code không hợp lệ! Định dạng: ATTEND:<MSSV>", "error");
    }
  };

  // Reset danh sách
  const resetHistory = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử điểm danh?")) {
      try {
        await Preferences.remove({ key: "attendance" });
        setHistory([]);
        showMessage("Đã xóa toàn bộ lịch sử điểm danh", "success");
      } catch (error) {
        console.error("Error resetting attendance history:", error);
        showMessage("Lỗi xóa dữ liệu!", "error");
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (history.length === 0) {
      showMessage("Không có dữ liệu để xuất!", "error");
      return;
    }
    try {
      exportCSV(filteredHistory);
      showMessage("Đã xuất file CSV thành công!", "success");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      showMessage("Lỗi xuất file CSV!", "error");
    }
  };

  // Filter history
  const filteredHistory = history.filter(record =>
    record.mssv.toLowerCase().includes(filter.toLowerCase())
  );

  // Get statistics
  const todayCount = history.filter(h => h.date === new Date().toLocaleDateString()).length;
  const uniqueStudents = new Set(history.map(h => h.mssv)).size;

  return (
    <div className="app-container">
      <div className="header">
        <h1>�� QR Attendance System</h1>
        <p className="subtitle">Hệ thống điểm danh bằng mã QR</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{history.length}</div>
          <div className="stat-label">Tổng lượt điểm danh</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{todayCount}</div>
          <div className="stat-label">Hôm nay</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{uniqueStudents}</div>
          <div className="stat-label">Sinh viên</div>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="scanner-section">
        {scanning ? (
          <div className="scanner-container">
            <QRScanner onScan={handleScan} />
            <button 
              className="btn btn-secondary"
              onClick={() => setScanning(false)}
            >
              ❌ Hủy quét
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary scan-button"
            onClick={() => setScanning(true)}
          >
            📷 Quét mã QR
          </button>
        )}
      </div>

      {/* History Section */}
      <div className="history-section">
        <div className="section-header">
          <h2>📋 Lịch sử điểm danh ({filteredHistory.length} bản ghi)</h2>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm MSSV..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <p>📝 Chưa có dữ liệu điểm danh</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((record, index) => (
              <div key={index} className="history-item">
                <div className="student-info">
                  <div className="mssv">{record.mssv}</div>
                  <div className="datetime">
                    📅 {record.date} ⏰ {record.time}
                  </div>
                </div>
                <div className="status-badge">✅</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn btn-success"
          onClick={handleExportCSV} 
          disabled={history.length === 0}
        >
          📊 Xuất CSV
        </button>
        <button 
          className="btn btn-danger"
          onClick={resetHistory}
          disabled={history.length === 0}
        >
          🗑️ Xóa tất cả
        </button>
      </div>
    </div>
  );
}

export default App; 