'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { Role, getRoleLabel } from '@/types';

export default function ResearchersPage() {
  const { language, t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('RESEARCHER');
  const [teamId, setTeamId] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [error, setError] = useState('');

  const isUniversityEmail = (value: string) => /^[a-zA-Z0-9._%+-]+@univ-khenchela\.dz$/.test(value);

  const load = async () => {
    const [usersRes, teamsRes] = await Promise.all([api.get('/users'), api.get('/teams')]);
    setUsers(usersRes.data.data);
    setTeams(teamsRes.data.data);
    setError('');
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(t('researchers.requiredFields'));
      return;
    }
    if (!isUniversityEmail(email)) {
      setError(t('researchers.universityEmailError'));
      return;
    }

    await api.post('/users', { fullName: name, email, password, role, teamId });
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('RESEARCHER');
    setTeamId('');
    setShowCreate(false);
    await load();
  };

  const openEditUser = (user: any) => {
    setSelectedUserId(user.id);
    setName(user.fullName || '');
    setEmail(user.email || '');
    setPassword('');
    setRole(user.role || 'RESEARCHER');
    setTeamId(user.team?.id || '');
    setShowEditUser(true);
  };

  const updateUser = async () => {
    if (!selectedUserId) {
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError(t('researchers.nameEmailRequired'));
      return;
    }
    if (!isUniversityEmail(email)) {
      setError(t('researchers.universityEmailError'));
      return;
    }

    await api.patch(`/users/${selectedUserId}`, {
      fullName: name,
      email,
      password: password.trim() || undefined,
      role,
      teamId: role === 'DIRECTOR' ? undefined : teamId || undefined,
    });
    setShowEditUser(false);
    setSelectedUserId('');
    setPassword('');
    setTeamId('');
    await load();
  };

  const toggleActive = async (id: string) => {
    await api.patch(`/users/${id}/toggle-active`);
    await load();
  };

  const deleteUser = async (id: string) => {
    const confirmed = window.confirm(t('researchers.deleteConfirm'));
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/users/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('researchers.deleteError'));
    }
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {error ? <div className="alert alert-danger"><i className="bx bx-error-circle" />{error}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        <Button onClick={() => setShowCreate(true)}><i className="bx bx-plus" />{t('researchers.addUser')}</Button>
      </div>

      <Table headers={[t('common.fullName'), t('common.emailAddress'), t('common.role'), t('common.team'), t('researchers.status'), t('common.actions')]} loading={false}>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.fullName}</td>
            <td>{user.email}</td>
            <td><Badge status={user.role}>{getRoleLabel(user.role, language)}</Badge></td>
            <td>{user.team?.name || '-'}</td>
            <td>{user.isActive ? t('researchers.active') : t('researchers.inactive')}</td>
            <td>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="outline" onClick={() => openEditUser(user)}>
                  <i className="bx bx-shield-quarter" />
                  {t('common.edit')}
                </Button>
                <Button variant={user.isActive ? 'danger' : 'success'} onClick={() => toggleActive(user.id)}>
                  {user.isActive ? t('researchers.disable') : t('researchers.enable')}
                </Button>
                <Button variant="danger" onClick={() => deleteUser(user.id)}>
                  <i className="bx bx-trash" />
                  {t('common.delete')}
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('researchers.createUser')}>
        <div style={{ display: 'grid', gap: 14 }}>
          {error ? <div className="alert alert-danger"><i className="bx bx-error-circle" />{error}</div> : null}
          <Input label={t('common.fullName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label={t('common.emailAddress')}
            type="email"
            placeholder="name@univ-khenchela.dz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input label={t('common.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select label={t('common.role')} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="DIRECTOR">{t('common.roleDirector')}</option>
            <option value="TEAM_LEADER">{t('common.roleTeamLeader')}</option>
            <option value="RESEARCHER">{t('common.roleResearcher')}</option>
          </Select>
          <Select label={t('common.team')} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">{t('researchers.noTeam')}</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </Select>
          <Button onClick={createUser}>{t('common.save')}</Button>
        </div>
      </Modal>

      <Modal open={showEditUser} onClose={() => setShowEditUser(false)} title={t('researchers.editUser')} size="sm">
        <div style={{ display: 'grid', gap: 14 }}>
          <Input label={t('common.fullName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label={t('common.emailAddress')}
            type="email"
            placeholder="name@univ-khenchela.dz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={t('researchers.newPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('researchers.passwordPlaceholder')}
          />
          <Select label={t('common.role')} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="DIRECTOR">{t('common.roleDirector')}</option>
            <option value="TEAM_LEADER">{t('common.roleTeamLeader')}</option>
            <option value="RESEARCHER">{t('common.roleResearcher')}</option>
          </Select>
          {role !== 'DIRECTOR' ? (
            <Select label={t('common.team')} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">{t('researchers.noTeam')}</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </Select>
          ) : null}
          <Button onClick={updateUser}>{t('researchers.saveChanges')}</Button>
        </div>
      </Modal>
    </div>
  );
}
