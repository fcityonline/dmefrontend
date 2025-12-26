// frontend/src/pages/QuizAnalyticsPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import DarkModeToggle from "../components/DarkModeToggle";
import BottomNavBar from "../components/BottomNavBar";
import ProfileDrawer from "../components/ProfileDrawer";
import { socket } from "../socket";
import "../styles/global.css";

export default function QuizAnalyticsPage() {
  const { user } = useContext(AuthContext);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    averageRank: 0,
    bestRank: 0
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveQuizAnalytics, setLiveQuizAnalytics] = useState(null);
  const [todayQuiz, setTodayQuiz] = useState(null);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    loadQuizHistory();
    loadTodayQuiz();
    
    // Listen for real-time quiz analytics updates
    socket.on('quiz-analytics-update', (data) => {
      console.log('📊 Real-time quiz analytics update:', data);
      setLiveQuizAnalytics(data);
    });

    // Listen for user analytics updates (when user completes quiz)
    socket.on('user-analytics-update', (data) => {
      console.log('👤 User analytics update:', data);
      if (data.type === 'quiz-completed') {
        // Refresh quiz history
        loadQuizHistory();
      }
    });

    // Refresh analytics every 5 seconds if there's a live quiz
    const interval = setInterval(() => {
      if (todayQuiz?._id) {
        loadLiveQuizAnalytics(todayQuiz._id);
      }
    }, 5000);

    return () => {
      socket.off('quiz-analytics-update');
      socket.off('user-analytics-update');
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTodayQuiz = async () => {
    try {
      const response = await API.get("/quiz/today");
      if (response.data?.exists && response.data?.quiz) {
        setTodayQuiz(response.data.quiz);
        if (response.data.quiz.isLive) {
          loadLiveQuizAnalytics(response.data.quiz._id);
        }
      }
    } catch (error) {
      console.error("Failed to load today's quiz:", error);
    }
  };

  const loadLiveQuizAnalytics = async (quizId) => {
    try {
      const response = await API.get(`/quiz/analytics/${quizId}`);
      setLiveQuizAnalytics(response.data);
    } catch (error) {
      console.error("Failed to load live quiz analytics:", error);
    }
  };

  // const loadQuizHistory = async () => {
  //   try {
  //     const response = await API.get("/quiz/history");
  //     const history = response.data;
  //     setQuizHistory(history);

  //     // Calculate statistics
  //     if (history.length > 0) {
  //       const totalQuizzes = history.length;
  //       const totalScore = history.reduce((sum, quiz) => sum + quiz.score, 0);
  //       const totalCorrect = history.reduce((sum, quiz) => sum + quiz.correctAnswers, 0);
  //       const totalQuestions = history.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
  //       const totalRank = history.reduce((sum, quiz) => sum + quiz.rank, 0);

  //       setStats({
  //         totalQuizzes,
  //         averageScore: Math.round(totalScore / totalQuizzes),
  //         bestScore: Math.max(...history.map(q => q.score)),
  //         totalCorrect,
  //         totalQuestions,
  //         averageRank: Math.round(totalRank / totalQuizzes),
  //         bestRank: Math.min(...history.map(q => q.rank))
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Failed to load quiz history:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
    const loadQuizHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get("/quiz/history");
      console.log("📊 Quiz history response:", response?.data);
      
      // Backend returns { quizHistory: [...] }
      const maybeData = response?.data;
      const history = Array.isArray(maybeData)
        ? maybeData
        : Array.isArray(maybeData?.quizHistory)
          ? maybeData.quizHistory
          : [];

      console.log("📊 Processed quiz history:", history);
      setQuizHistory(history);

      if (history.length > 0) {
        const totalQuizzes = history.length;
        const totalScore = history.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
        const totalCorrect = history.reduce((sum, q) => {
          // Try to get correctAnswers from the history entry, fallback to score if not available
          const correct = Number(q.correctAnswers);
          if (!isNaN(correct) && correct > 0) return sum + correct;
          // If correctAnswers is missing, use score as approximation (1 point per correct answer)
          return sum + (Number(q.score) || 0);
        }, 0);
        const totalQuestions = history.reduce((sum, q) => {
          const total = Number(q.totalQuestions);
          return sum + (isNaN(total) || total === 0 ? 50 : total); // Default to 50 if missing
        }, 0);
        const validRanks = history.filter(q => q.rank && Number(q.rank) > 0 && Number(q.rank) !== Infinity);
        const totalRank = validRanks.reduce((sum, q) => sum + (Number(q.rank) || 0), 0);

        setStats({
          totalQuizzes,
          averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
          bestScore: Math.max(...history.map(q => Number(q.score) || 0), 0),
          totalCorrect,
          totalQuestions,
          averageRank: validRanks.length > 0 ? Math.round(totalRank / validRanks.length) : 0,
          bestRank: validRanks.length > 0 ? Math.min(...validRanks.map(q => Number(q.rank) || Infinity)) : 0
        });
      } else {
        setStats({
          totalQuizzes: 0, averageScore: 0, bestScore: 0,
          totalCorrect: 0, totalQuestions: 0, averageRank: 0, bestRank: 0
        });
      }
    } catch (err) {
      console.error("Failed to load quiz history:", err);
      // Show fallback empty state
      setQuizHistory([]);
      setStats({
        totalQuizzes: 0, averageScore: 0, bestScore: 0,
        totalCorrect: 0, totalQuestions: 0, averageRank: 0, bestRank: 0
      });
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getAccuracy = (correct, total) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return "🏆";
    return "📊";
  };

  if (!user) {
    return null;
  }

  return (
    <>
            <header className="header">
              <div className="logo">
                <img src="/imgs/logo-DME2.png" alt="Logo" />
              </div>
              <DarkModeToggle />
              <h2>QUIZ ANALYTICS</h2>
            </header>

      <main className="analytics-wrapper home-container">
        <div className="analytics-container">
        {/* Live Quiz Analytics Section */}
        {liveQuizAnalytics && todayQuiz?.isLive && (
          <div className="live-quiz-analytics" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h2 style={{ marginTop: 0, color: 'white' }}>🔴 Live Quiz Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{liveQuizAnalytics.totalParticipants || 0}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Participants</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{liveQuizAnalytics.participantsAnswered || 0}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Answered</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{liveQuizAnalytics.currentQuestionIndex + 1 || 0}/{liveQuizAnalytics.totalQuestions || 50}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Current Question</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{liveQuizAnalytics.averageScore?.toFixed(1) || 0}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg Score</div>
              </div>
            </div>
          </div>
        )}

        <div className="stats-overview">
          <h2>📊 Quiz Performance</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalQuizzes}</span>
                <span className="stat-label">Total Quizzes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <span className="stat-value">{stats.averageScore}</span>
                <span className="stat-label">Avg Score</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <span className="stat-value">{stats.bestScore}</span>
                <span className="stat-label">Best Score</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">{getAccuracy(stats.totalCorrect, stats.totalQuestions)}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <span className="stat-value">{stats.averageRank || 0}</span>
                <span className="stat-label">Avg Rank</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🥇</div>
              <div className="stat-info">
                <span className="stat-value">{stats.bestRank || 0}</span>
                <span className="stat-label">Best Rank</span>
              </div>
            </div>
          </div>
        </div>

        <div className="quiz-history-section">
          <h3>📚 Quiz History</h3>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>⌛️Loading quiz history...</p>
            </div>
          ) : quizHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No quiz history yet</h3>
              <p>You haven't participated in any quizzes yet.</p>
              <button 
                className="quiz-btn"
                onClick={() => window.location.href = "/quiz"}
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="quiz-list">
              {quizHistory.map((quiz, index) => (
                <div key={quiz._id || quiz.quizId || `quiz-${index}`} className="quiz-item">
                  <div className="quiz-header">
                    <div className="quiz-date">
                      <span className="date-icon">📅</span>
                      <span>{formatDate(quiz.date)}</span>
                    </div>
                    <div className="quiz-rank">
                      <span className="rank-badge">{getRankBadge(quiz.rank || 0)}</span>
                      <span className="rank-text">
                        Rank #{quiz.rank && Number(quiz.rank) > 0 ? quiz.rank : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="quiz-stats">
                    <div className="stat-row">
                      <span className="stat-label">Score:</span>
                      <span className="stat-value">{quiz.score || 0} points</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Correct:</span>
                      <span className="stat-value">
                        {quiz.correctAnswers || quiz.score || 0}/{quiz.totalQuestions || 50}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Accuracy:</span>
                      <span className="stat-value">
                        {getAccuracy(quiz.correctAnswers || quiz.score || 0, quiz.totalQuestions || 50)}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Time:</span>
                      <span className="stat-value">{quiz.timeSpent ? Math.round(quiz.timeSpent / 60) : 0} min</span>
                    </div>
                  </div>

                  <div className="quiz-performance">
                    <div className="performance-bar">
                      <div 
                        className="performance-fill"
                        style={{ width: `${getAccuracy(quiz.correctAnswers || quiz.score || 0, quiz.totalQuestions || 50)}%` }}
                      ></div>
                    </div>
                    <span className="performance-text">
                      {getAccuracy(quiz.correctAnswers || quiz.score || 0, quiz.totalQuestions || 50)}% accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics-actions">
          <button 
            className="action-btn primary"
            onClick={() => window.location.href = "/quiz"}
          >
            Take Today's Quiz
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => window.location.href = "/winners"}
          >
            View Winners
          </button>
        </div>
        </div>
      </main>

      <ProfileDrawer 
        key={user?._id || 'no-user'} 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
      <BottomNavBar onProfileClick={() => setDrawerOpen(true)} />
    </>
  );
}
