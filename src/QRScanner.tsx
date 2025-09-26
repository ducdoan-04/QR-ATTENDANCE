import { useEffect, useRef, useState, useCallback } from "react";

import { BrowserMultiFormatReader } from "@zxing/library";

interface QRScannerProps {
  onScan: (text: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader;
    
    const startScanning = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Test camera permission first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
        } catch (permError) {
          setError("Không có quyền truy cập camera. Vui lòng cấp quyền camera.");
          setIsLoading(false);
          setHasPermission(false);
          return;
        }
        
        codeReader = new BrowserMultiFormatReader();
        
        // Get available video devices
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          setError("Không tìm thấy camera nào.");
          setIsLoading(false);
          return;
        }

        // Prefer back camera for mobile devices
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

        // Simple callback for scanning
        const scanCallback = (result: any, err: any) => {
          if (result) {
            console.log("QR Code detected:", result.getText());
            onScan(result.getText());
            return;
          }
          
          if (err && err.name !== "NotFoundException") {
            console.error("QR Scanner Error:", err);
            setError("Lỗi quét mã QR: " + err.message);
          }
        };

        // Start scanning
        if (videoRef.current) {
          await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, scanCallback);
        }
        
        setIsLoading(false);
        
      } catch (err: any) {
        console.error("Scanner initialization error:", err);
        setError("Không thể khởi tạo camera: " + err.message);
        setIsLoading(false);
        setHasPermission(false);
      }
    };

    startScanning();

    return () => {
      if (codeReader) {
        codeReader.reset();
      }
      // Clean up video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [onScan]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      window.location.reload();
    } catch (err) {
      setError("Không thể cấp quyền camera. Vui lòng kiểm tra cài đặt trình duyệt.");
    }
  };

  const retryScan = () => {
    setError("");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="scanner-loading">
        <div className="loading-spinner"></div>
        <p>Đang khởi tạo camera...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="scanner-error">
        <div className="error-icon">📷❌</div>
        <h3>Không có quyền truy cập camera</h3>
        <p>Vui lòng cấp quyền camera để sử dụng tính năng quét QR</p>
        <button className="btn btn-primary" onClick={requestPermission}>
          Cấp quyền camera
        </button>
      </div>
    );
  }

  return (
    <div className="scanner-wrapper">
      <div className="scanner-header">
        <h3>📷 Quét mã QR</h3>
        <p>Đưa mã QR vào khung hình để quét</p>
      </div>
      
      <div className="video-container">
        <video 
          ref={videoRef} 
          className="scanner-video"
          autoPlay
          playsInline
          muted
        />
        <div className="scanner-overlay">
          <div className="scanner-frame"></div>
        </div>
      </div>
      
      {error && (
        <div className="scanner-error-message">
          <p>❌ {error}</p>
          <div className="error-actions">
            <button 
              className="btn btn-secondary"
              onClick={retryScan}
            >
              🔄 Thử lại
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setError("")}
            >
              ✨ Tiếp tục quét
            </button>
          </div>
        </div>
      )}
      
      <div className="scanner-instructions">
        <p> <strong>Hướng dẫn:</strong></p>
        <ul>
          <li>Đảm bảo mã QR có định dạng: <code>ATTEND:MSSV</code></li>
          <li>Giữ camera ổn định và đủ ánh sáng</li>
          <li>Đưa mã QR vào khung hình vuông</li>
          <li>Nếu không quét được, thử mã QR khác</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
