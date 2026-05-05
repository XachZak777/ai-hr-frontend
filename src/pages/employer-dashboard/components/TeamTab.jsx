import { useState } from 'react';
import { DashboardSection } from '../../../components/CommonBlocks';
import { notify } from '../../../utils/notifications';

const initialMembers = [];

export default function TeamTab() {
  const [members, setMembers] = useState(initialMembers);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const addMember = () => {
    if (!newMemberName || !newMemberRole) {
      notify('Enter team member name and role.', 'error');
      return;
    }
    setMembers((current) => [...current, [newMemberName, newMemberRole]]);
    setNewMemberName('');
    setNewMemberRole('');
    setShowAddMember(false);
    notify('Team member added.', 'success');
  };

  const removeMember = (name) => {
    setMembers((current) => current.filter(([memberName]) => memberName !== name));
  };

  return (
    <DashboardSection title="Team Members">
      <div className="team-grid">
        {members.map(([name, role]) => (
          <div key={name} className="team-member">
            <h4>{name}</h4>
            <p className="muted">{role}</p>
            <button className="btn-light small" onClick={() => removeMember(name)}>Remove</button>
          </div>
        ))}
        <div className="team-member plus-member">
          <button className="btn-dark" onClick={() => setShowAddMember(true)}>+ Add Team Member</button>
        </div>
      </div>
      {showAddMember && (
        <div className="details-panel">
          <h4>Add Team Member</h4>
          <div className="form-row">
            <input placeholder="Full name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
            <input placeholder="Role" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} />
          </div>
          <div className="inline-actions">
            <button className="btn-dark" onClick={addMember}>Add</button>
            <button className="btn-light" onClick={() => setShowAddMember(false)}>Cancel</button>
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
