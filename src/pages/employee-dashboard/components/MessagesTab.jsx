import { useState } from 'react';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';

const mockMessages = [];

export default function MessagesTab() {
  const [replyTo, setReplyTo] = useState('');
  const [replyText, setReplyText] = useState('');

  const handleSend = (sender) => {
    if (!replyText.trim()) {
      notify('Please write a reply before sending.', 'error');
      return;
    }
    setReplyTo('');
    setReplyText('');
    notify(`Reply sent to ${sender}.`, 'success');
  };

  return (
    <DashboardSection title="Messages">
      <div className="messages-container">
        {mockMessages.map(([sender, time, message]) => (
          <div key={sender} className="message-item">
            <div className="message-header">
              <h4>{sender}</h4>
              <span className="time">{time}</span>
            </div>
            <p className="message-content">{message}</p>
            {replyTo === sender ? (
              <div className="reply-box">
                <textarea
                  rows="2"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                />
                <div className="inline-actions">
                  <button className="btn-dark small" onClick={() => handleSend(sender)}>Send</button>
                  <button className="btn-light small" onClick={() => setReplyTo('')}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn-light" onClick={() => setReplyTo(sender)}>Reply</button>
            )}
          </div>
        ))}
        {mockMessages.length === 0 && (
          <div className="empty-state">
            <h4>No messages yet</h4>
            <p className="muted">Your conversations with recruiters will appear here.</p>
          </div>
        )}
      </div>
    </DashboardSection>
  );
}
