import { useState } from 'react';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';

export default function AiAgentTab() {
  const [agentName, setAgentName] = useState('');
  const [agentNameError, setAgentNameError] = useState('');

  const handleSave = () => {
    if (!agentName.trim()) {
      setAgentNameError('Agent name is required');
      return;
    }
    setAgentNameError('');
    notify('AI Agent settings saved successfully.', 'success');
  };

  return (
    <DashboardSection title="AI Agent Configuration">
      <div className="settings-form">
        <div className="form-group">
          <label>AI Agent Name</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => { setAgentName(e.target.value); if (agentNameError) setAgentNameError(''); }}
            placeholder="e.g., HireAI Assistant"
            className={agentNameError ? 'input-error' : ''}
          />
          {agentNameError && <span className="error-text">{agentNameError}</span>}
        </div>
        <div className="form-group">
          <label>Matching Algorithm Strength</label>
          <select>
            <option>Conservative (High Quality Matches)</option>
            <option>Balanced</option>
            <option>Aggressive (More Candidates)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            Enable AI Agent
          </label>
        </div>
        <button className="btn-dark" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </DashboardSection>
  );
}
