import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUploader from "./pages/FileUploader";
import QASystem from "./pages/QASystem";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUploader />} />
        <Route path="/qa" element={<QASystem />} />
      </Routes>
    </Router>
  );
}

export default App;
