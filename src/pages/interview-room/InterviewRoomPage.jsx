import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/CommonBlocks';
import {
  getInterview,
  startInterview,
  answerInterview,
  startVoiceInterview,
  answerVoiceInterview,
} from '../../api/interviews';
import { getJob } from '../../api/jobs';
import { notify } from '../../utils/notifications';

// ── Audio helpers ─────────────────────────────────────────────────────────────

function playBase64Audio(audioBase64, audioContentType) {
  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: audioContentType });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  return audio.play();
}

// ── Interview Room ────────────────────────────────────────────────────────────

export default function InterviewRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Interview metadata
  const [interview, setInterview] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Core interview state (matches the spec)
  const [mode, setMode] = useState('voice');
  const [aiMessage, setAiMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [started, setStarted] = useState(false);

  // Last AI audio — enables "Play Again"
  const lastAudioRef = useRef({ base64: null, contentType: null });
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    getInterview(id)
      .then((data) => {
        setInterview(data);
        const status = data.status?.toUpperCase();
        if (status === 'IN_PROGRESS') setStarted(true);
        if (status === 'COMPLETED') {
          setStarted(true);
          setInterviewComplete(true);
          setScore(data.score);
          setFeedback(data.feedback);
        }
        if (data.jobId) {
          getJob(data.jobId)
            .then((job) => setJobTitle(job.title ?? ''))
            .catch(() => {});
        }
      })
      .catch(() => notify('Failed to load interview.', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── "Play AI Voice Again" ─────────────────────────────────────────────────

  const handlePlayAgain = () => {
    const { base64, contentType } = lastAudioRef.current;
    if (!base64) return;
    playBase64Audio(base64, contentType);
  };

  // ── Start interview ───────────────────────────────────────────────────────

  const handleStart = async () => {
    setSubmitting(true);
    try {
      if (mode === 'voice') {
        const data = await startVoiceInterview(id);
        setAiMessage(data.aiMessage ?? '');
        setInterviewComplete(data.interviewComplete ?? false);
        setScore(data.score ?? null);
        setFeedback(data.feedback ?? null);
        if (data.audioBase64) {
          lastAudioRef.current = { base64: data.audioBase64, contentType: data.audioContentType };
          await playBase64Audio(data.audioBase64, data.audioContentType);
        }
      } else {
        const data = await startInterview(id);
        setAiMessage(data.aiMessage ?? '');
        setInterviewComplete(data.interviewComplete ?? false);
      }
      setStarted(true);
    } catch (err) {
      notify(err.message ?? 'Failed to start interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Text answer ───────────────────────────────────────────────────────────

  const handleSendText = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const data = await answerInterview(id, answer.trim(), jobTitle);
      setAiMessage(data.aiMessage ?? '');
      setInterviewComplete(data.interviewComplete ?? false);
      setScore(data.score ?? null);
      setFeedback(data.feedback ?? null);
      setAnswer('');
    } catch (err) {
      notify(err.message ?? 'Failed to send answer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Voice answer ──────────────────────────────────────────────────────────

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      notify('Microphone access denied. Please allow microphone access and try again.', 'error');
    }
  };

  const handleStopAndSend = () => {
    setSubmitting(true);
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = async () => {
      try {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        recorder.stream?.getTracks().forEach((t) => t.stop());

        const data = await answerVoiceInterview(id, audioBlob, jobTitle);
        setTranscript(data.transcript ?? '');
        setAiMessage(data.aiMessage ?? '');
        setInterviewComplete(data.interviewComplete ?? false);
        setScore(data.score ?? null);
        setFeedback(data.feedback ?? null);

        if (data.audioBase64) {
          lastAudioRef.current = { base64: data.audioBase64, contentType: data.audioContentType };
          await playBase64Audio(data.audioBase64, data.audioContentType);
        }
      } catch (err) {
        notify(err.message ?? 'Failed to send voice answer.', 'error');
      } finally {
        setSubmitting(false);
      }
    };

    recorder.stop();
    setRecording(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="page dashboard">
        <div className="interview-room-container">
          <p className="muted">Loading interview...</p>
        </div>
      </main>
    );
  }

  const statusLabel = interview?.status ?? 'SCHEDULED';

  return (
    <main className="page dashboard">
      <div className="interview-room-container">
        <PageTitle
          title="AI Interview Room"
          subtitle={jobTitle || undefined}
          actions={
            <button className="btn-light" onClick={() => navigate('/employee-schedule')}>
              Back
            </button>
          }
        />

        {/* Status */}
        <div className="ir-status-row">
          <span className="ir-status-label">Status:</span>
          <span className={`agent-status ${statusLabel.toLowerCase().replace('_', '-')}`}>
            {statusLabel.replace('_', ' ')}
          </span>
        </div>

        {/* Before interview starts */}
        {!started && (
          <div className="ir-block">
            <p className="ir-block-label">Interview Mode</p>
            <p className="muted" style={{ marginBottom: 14 }}>
              Choose your preferred answer mode, then start the interview.
            </p>
            <ModeToggle mode={mode} onChange={setMode} disabled={submitting} />
            <div className="ir-actions">
              <button className="btn-dark" onClick={handleStart} disabled={submitting}>
                {submitting ? 'Starting...' : 'Start Interview'}
              </button>
            </div>
          </div>
        )}

        {/* AI message */}
        {started && aiMessage && (
          <div className="ir-block">
            <p className="ir-block-label">AI Interviewer</p>
            <blockquote className="ir-ai-message">{aiMessage}</blockquote>
            {lastAudioRef.current.base64 && (
              <div className="ir-actions">
                <button className="btn-light btn-sm" onClick={handlePlayAgain} type="button">
                  ▶ Play AI Voice Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Waiting for AI */}
        {started && !aiMessage && !interviewComplete && (
          <div className="ir-block">
            <p className="muted">Waiting for AI response...</p>
          </div>
        )}

        {/* Transcribed voice answer */}
        {transcript && (
          <div className="ir-block">
            <p className="ir-block-label">Your answer (transcribed)</p>
            <blockquote className="ir-transcript">{transcript}</blockquote>
          </div>
        )}

        {/* Answer controls */}
        {started && !interviewComplete && (
          <div className="ir-block">
            <div className="ir-answer-header">
              <p className="ir-block-label" style={{ margin: 0 }}>Your Answer</p>
              <ModeToggle mode={mode} onChange={setMode} disabled={submitting || recording} />
            </div>

            {mode === 'text' && (
              <>
                <textarea
                  className="ir-textarea"
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={submitting}
                />
                <div className="ir-actions">
                  <button
                    className="btn-dark"
                    onClick={handleSendText}
                    disabled={submitting || !answer.trim()}
                  >
                    {submitting ? 'Sending...' : 'Send Answer'}
                  </button>
                </div>
              </>
            )}

            {mode === 'voice' && (
              <div className="ir-voice-controls">
                {!recording && !submitting && (
                  <button className="btn-dark" onClick={handleStartRecording} type="button">
                    Start Recording
                  </button>
                )}
                {recording && (
                  <>
                    <div className="voice-recording-active">
                      <span className="recording-dot" />
                      <span>Recording...</span>
                    </div>
                    <button className="btn-dark" onClick={handleStopAndSend} type="button">
                      Stop &amp; Send
                    </button>
                  </>
                )}
                {submitting && !recording && (
                  <p className="muted small">Processing your answer...</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Result — always visible once started, dashes until complete */}
        {started && (
          <div className="ir-result-block">
            <p className="ir-block-label">Interview Result</p>
            <div className="ir-result-row">
              <span className="ir-result-key">Score</span>
              <span className={`ir-result-value ${score != null ? 'ir-score-filled' : ''}`}>
                {score != null ? `${score} / 100` : '—'}
              </span>
            </div>
            <div className="ir-result-row ir-result-row--top">
              <span className="ir-result-key">Feedback</span>
              <span className="ir-result-value">{feedback ?? '—'}</span>
            </div>
            {interviewComplete && (
              <div className="ir-actions">
                <button className="btn-dark" onClick={() => navigate('/employee-schedule')}>
                  Return to Schedule
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ModeToggle({ mode, onChange, disabled }) {
  return (
    <div className="ir-mode-toggle">
      <button
        className={`ir-mode-btn ${mode === 'text' ? 'active' : ''}`}
        onClick={() => onChange('text')}
        disabled={disabled}
        type="button"
      >
        Text
      </button>
      <button
        className={`ir-mode-btn ${mode === 'voice' ? 'active' : ''}`}
        onClick={() => onChange('voice')}
        disabled={disabled}
        type="button"
      >
        Voice
      </button>
    </div>
  );
}
