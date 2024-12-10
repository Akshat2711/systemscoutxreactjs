
import './App.css';
import './components/Api';
import Main from './components/Main';
import {Login} from './components/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<Login />} />

          {/* Home route */}
          <Route path="/main" element={<Main/>} />

        
          {/* Uncomment this if you want a fallback for undefined routes */}
          {/* <Route path="*" element={<NoPage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
