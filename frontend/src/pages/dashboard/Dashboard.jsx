import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [cvCount, setCvCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch CV count
        const cvResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/cv/count`);
        setCvCount(cvResponse.data.count);

        // Fetch candidate count
        const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/candidates/count`);
        setCandidateCount(candidateResponse.data.count);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord</h1>
      <p>Bienvenue sur votre tableau de bord de recrutement.</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>CV analysés</h3>
          <p>{cvCount}</p>
        </div>
        <div className="stat-card">
          <h3>Candidats qualifiés</h3>
          <p>{candidateCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;