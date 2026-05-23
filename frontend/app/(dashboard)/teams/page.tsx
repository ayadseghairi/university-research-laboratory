'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatDZD, getPercentage } from '@/lib/utils';
import { getStoredUser } from '@/lib/auth';

export default function TeamsPage() {
  const { language, t } = useLanguage();
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [error, setError] = useState('');
  const currentUser = getStoredUser();

  const load = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([api.get('/teams'), api.get('/users')]);
      setTeams(teamsRes.data.data);
      setUsers(usersRes.data.data.filter((user: any) => user.role !== 'DIRECTOR'));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('teams.loadError'));
      setTeams([]);
      setUsers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTeam = async () => {
    if (!name.trim() || !leaderId) {
      setError(t('teams.requiredFields'));
      return;
    }
    try {
      await api.post('/teams', { name, description, leaderId });
      setShowCreate(false);
      setName('');
      setDescription('');
      setLeaderId('');
      setError('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('teams.createError'));
    }
  };

  const openEdit = (team: any) => {
    setSelectedTeamId(team.id);
    setName(team.name || '');
    setDescription(team.description || '');
    setLeaderId(team.leader?.id || '');
    setShowEdit(true);
  };

  const updateTeam = async () => {
    try {
      await api.patch(`/teams/${selectedTeamId}`, { name, description, leaderId });
      setShowEdit(false);
      setSelectedTeamId('');
      setError('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('teams.updateError'));
    }
  };

  const deleteTeam = async (id: string) => {
    const confirmed = window.confirm(t('teams.deleteConfirm'));
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/teams/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('teams.deleteError'));
    }
  };

  const disableTeam = async (id: string) => {
    const confirmed = window.confirm(t('teams.disableConfirm'));
    if (!confirmed) {
      return;
    }
    try {
      await api.patch(`/teams/${id}/disable`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('teams.disableError'));
    }
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {error ? <div className="alert alert-danger"><i className="bx bx-error-circle" />{error}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        <Button onClick={() => setShowCreate(true)}><i className="bx bx-plus" />{t('teams.addTeam')}</Button>
      </div>

      <div className="grid-auto">
        {teams.map((team) => {
          const allocation = team.allocations?.[0];
          const percentage = allocation ? getPercentage(Number(allocation.spentAmount), Number(allocation.allocatedAmount)) : 0;
          return (
            <Card key={team.id} title={team.name}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="muted">{t('teams.leader')}: {team.leader.fullName}</div>
                <div className="muted">{t('teams.members')}: {team.memberCount || team.members?.length || 0}</div>
                {allocation ? (
                  <>
                    <ProgressBar percentage={percentage} />
                    <div className="help">{t('teams.budget')}: {formatDZD(allocation.spentAmount, language)} / {formatDZD(allocation.allocatedAmount, language)}</div>
                  </>
                ) : null}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button variant="outline" onClick={() => setExpanded(expanded === team.id ? null : team.id)}>{t('teams.showMembers')}</Button>
                  <Button variant="outline" onClick={() => openEdit(team)}><i className="bx bx-edit" />{t('common.edit')}</Button>
                  <Button variant="danger" onClick={() => deleteTeam(team.id)}><i className="bx bx-trash" />{t('common.delete')}</Button>
                  <Button variant="ghost" onClick={() => disableTeam(team.id)}><i className="bx bx-block" />{t('teams.disable')}</Button>
                </div>
                {expanded === team.id ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(team.members || []).map((member: any) => (
                      <div key={member.user.id} className="card" style={{ padding: 12 }}>
                        <i className="bx bxs-user" style={{ marginLeft: 8 }} />
                        {member.user.fullName}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('teams.createTeam')}>
        <div style={{ display: 'grid', gap: 14 }}>
          {error ? <div className="alert alert-danger"><i className="bx bx-error-circle" />{error}</div> : null}
          <Input label={t('teams.teamName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('teams.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label={t('teams.leader')} value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
            <option value="">{t('teams.chooseLeader')}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} {user.role === 'TEAM_LEADER' ? `(${t('common.teamLeader')})` : `(${t('teams.promoteLeader')})`}
              </option>
            ))}
          </Select>
          <div className="help">{t('teams.createHint')}</div>
          <Button onClick={createTeam}>{t('common.save')}</Button>
        </div>
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={t('teams.editTeam')}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Input label={t('teams.teamName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('teams.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label={t('teams.leader')} value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
            <option value="">{t('teams.chooseLeader')}</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
          </Select>
          <Button onClick={updateTeam}>{t('common.save')}</Button>
        </div>
      </Modal>
    </div>
  );
}
