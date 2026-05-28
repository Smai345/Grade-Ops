import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [decision, setDecision] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 1. Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setDecision(null);
    setErrorMessage(null);
  };

  // 2. Send to Python Backend
  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${apiUrl}/api/grade`, formData, {
        timeout: 120000,
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error connecting to ML pipeline:", error);
      const serverMessage = error.response?.data?.error || error.message;
      setErrorMessage(`Failed to grade. Please keep this tab open and try again if needed. (${serverMessage})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => setDecision('✅ Approved by TA');
  const handleOverride = () => setDecision('❌ Overridden by TA');

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!result) return;
      if (e.key === 'a' || e.key === 'A') handleApprove();
      if (e.key === 'o' || e.key === 'O') handleOverride();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result]);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>TA Grading Dashboard</h1>

      {/* Upload Section */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          style={{ marginLeft: '10px', padding: '8px 16px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? "🤖 AI is Grading... Please keep this tab open" : "Submit for Grading"}
        </button>
        {errorMessage && (
          <div style={{ marginTop: '10px', color: '#a00', fontWeight: '600' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#fff4e5', borderRadius: '8px', color: '#7a4f01' }}>
          Grading is in progress. Please keep this browser tab open until the result is ready.
        </div>
      )}

      {/* Results Section */}
      {imagePreview && (
        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>

          {/* Left Side: Student Image */}
          <div style={{ flex: 1, border: '2px solid #333', padding: '10px' }}>
            <h3>Student Submission</h3>
            <img src={imagePreview} alt="Exam Scan" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
          </div>

          {/* Right Side: ML Pipeline Output */}
          <div style={{ flex: 1, border: '2px solid #ccc', padding: '20px' }}>
            <h3>AI Assessment</h3>

            {isLoading ? (
              <p>Analyzing handwriting and checking rubric...</p>
            ) : result ? (
              <>
                <h2 style={{ color: result.score > 5 ? 'green' : 'red' }}>Score: {result.score}/10.0</h2>
                <p><b>Reason:</b> {result.justification}</p>

                <div style={{ background: '#eee', padding: '10px', marginTop: '10px', fontSize: '12px' }}>
                  <b>Raw Extracted Text:</b> {result.extracted_text}
                </div>

                <hr style={{ margin: '20px 0' }} />
                <p>Use keyboard shortcuts: Press <b>'A'</b> to Approve, <b>'O'</b> to Override.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleApprove} style={{ background: 'green', color: 'white', padding: '10px', cursor: 'pointer' }}>Approve (A)</button>
                  <button onClick={handleOverride} style={{ background: 'red', color: 'white', padding: '10px', cursor: 'pointer' }}>Override (O)</button>
                </div>

                {decision && <h3 style={{ marginTop: '20px', color: '#333' }}>Status: {decision}</h3>}
              </>
            ) : (
              <p>Waiting for submission...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;