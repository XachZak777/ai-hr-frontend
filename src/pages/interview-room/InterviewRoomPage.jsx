import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardSection, PageTitle } from '../../components/CommonBlocks';
import { getInterview, startInterview, answerInterview, getInterviewMessages } from '../../api/interviews';
import { notify } from '../../utils/notifications';

export default function InterviewRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    Promise.all([
      getInterview(id),
      getInterviewMessages(id).catch(() => []),
    ])
      .then(([interviewData, msgs]) => {
        setInterview(interviewData);
        setMessages(msgs ?? []);
        const status = interviewData.status?.toUpperCase();
        if (status === 'IN_PROGRESS') setStarted(true);
        if (status === 'COMPLETED') {
          setStarted(true);
          setResult({ score: interviewData.score, feedback: interviewData.feedback });
        }
      })
      .catch(() => notify('Failed to load interview.', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      const turn = await startInterview(id);
      setStarted(true);
      if (turn?.aiMessage) setCurrentQuestion(turn.aiMessage);
    } catch (err) {
      notify(err.message ?? 'Failed to start interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const turn = await answerInterview(id, answer.trim());
      setAnswer('');
      if (turn.interviewComplete) {
        setResult({ score: turn.score, feedback: turn.feedback });
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(turn.aiMessage);
      }
    } catch (err) {
      notify(err.message ?? 'Failed to submit answer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page dashboard">
        <PageTitle title="Interview Room" subtitle="Loading..." />
      </main>
    );
  }

  return (
    <main className="page dashboard">
      <PageTitle
        title={`Interview #${id}`}
        subtitle={interview?.jobId ? `Job #${interview.jobId}` : ''}
        actions={
          <button className="btn-light" onClick={() => navigate('/employee-schedule')}>
            Back to Schedule
          </button>
        }
      />

      {result ? (
        <DashboardSection title="Interview Complete">
          <div className="interview-result">
            {result.score != null && <h3>Score: {result.score} / 100</h3>}
            <p className="muted">{result.feedback ?? 'Your results have been recorded.'}</p>
            <button className="btn-dark" onClick={() => navigate('/employee-schedule')}>
              Return to Schedule
            </button>
          </div>
        </DashboardSection>
      ) : !started ? (
        <DashboardSection title="Ready to Begin">
          <p className="muted">
            Your interview is scheduled. When you are ready, click below to start. The AI will ask
            you a series of questions based on the job requirements.
          </p>
          {interview?.scheduledAt && (
            <p className="muted">Scheduled for: {new Date(interview.scheduledAt).toLocaleString()}</p>
          )}
          <button className="btn-dark" onClick={handleStart} disabled={submitting}>
            {submitting ? 'Starting...' : 'Start Interview'}
          </button>
        </DashboardSection>
      ) : (
        <DashboardSection title="Interview in Progress">
          {messages.length > 0 && (
            <div className="interview-transcript">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role?.toLowerCase() ?? 'ai'}`}>
                  <p className={msg.role === 'CANDIDATE' ? 'bold' : 'muted'}>{msg.content}</p>
                </div>
              ))}
            </div>
          )}
          {currentQuestion && (
            <div className="interview-question">
              <p className="bold">{currentQuestion}</p>
            </div>
          )}
          <form onSubmit={handleAnswer}>
            <div className="form-group">
              <label>Your Answer</label>
              <textarea
                rows="5"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={submitting}
              />
            </div>
            <button className="btn-dark" type="submit" disabled={submitting || !answer.trim()}>
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>
        </DashboardSection>
      )}
    </main>
  );
}
