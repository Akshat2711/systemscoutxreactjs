import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Benchmark.css';

const Benchmark = () => {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // State to store error messages

  useEffect(() => {
    const fetchBenchmarkData = async () => {
      try {
        const API_URL = 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/benchmark`);
        setBenchmarkData(response.data);
      } catch (error) {
        setError('Error fetching benchmark data');
        console.error('Error fetching benchmark data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarkData();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  // Error handling: If there's an error, display an error message
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Loading state: Show loading message until data is fetched
  if (loading) {
    return (
      <div className="loadingdiv">
       
      </div>
    );
  }

  // Check if benchmarkData is available before rendering
  if (!benchmarkData) {
    return (
      <div className="error">
        No benchmark data available.
      </div>
    );
  }

  return (
    <div className="benchdiv">
      <h1>Benchmark Results</h1>

      <p><span>CPU SCORE: </span>{benchmarkData.cpu_score || 'N/A'}</p>
      <p><span>MEMORY SCORE: </span>{benchmarkData.memory_score || 'N/A'}</p>
      <p><span>DISK SCORE: </span>{benchmarkData.disk_score || 'N/A'}</p>
      <p className="totalscore"><span>TOTAL SCORE: </span>{benchmarkData.total_score || 'N/A'}</p>
    </div>
  );
};

export default Benchmark;
