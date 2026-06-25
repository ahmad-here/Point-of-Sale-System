'use client';

import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import DataBackupModal from '@/components/data-backup-modal';
import { Settings as SettingsIcon, Bell, Lock, User, Database, Palette } from 'lucide-react';
import { useState } from 'react';
import { useDataManager } from '@/lib/storage';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
}

export default function Settings() {
  const { clearAllData } = useDataManager();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    if (confirm('Are you absolutely sure? This will delete ALL data permanently.')) {
      clearAllData();
      setConfirmReset(false);
      alert('All data has been reset to default.');
    }
  };

  const settings: SettingItem[] = [
    {
      icon: <User className="w-5 h-5" />,
      title: 'Account Settings',
      description: 'Manage your account information and preferences',
      action: 'account',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Notifications',
      description: 'Configure notification preferences and alerts',
      action: 'notifications',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Security',
      description: 'Manage security settings and access control',
      action: 'security',
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Data Management',
      description: 'Backup, restore, and manage system data',
      action: 'data',
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: 'Appearance',
      description: 'Customize the look and feel of your POS system',
      action: 'appearance',
    },
    {
      icon: <SettingsIcon className="w-5 h-5" />,
      title: 'System Settings',
      description: 'Configure system-wide settings and integrations',
      action: 'system',
    },
  ];

  const handleSettingClick = (action?: string) => {
    switch (action) {
      case 'data':
        setIsBackupModalOpen(true);
        break;
      default:
        // Handle other settings later
        break;
    }
  };

  return (
    <div className="w-full">
      <Header title="Settings" subtitle="Manage your system preferences and configurations" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#eb5e28]/20 rounded-lg text-[#eb5e28]">
                  {setting.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#252422] mb-1">{setting.title}</h3>
                  <p className="text-sm text-[#403d39]">{setting.description}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => handleSettingClick(setting.action)}
              >
                {setting.action === 'data' ? 'Manage' : 'Configure'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Danger Zone */}
        <Card className="p-6 mt-6 border-red-500/30">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4">
            These actions cannot be undone. Please proceed with caution.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="danger" 
              size="md"
              onClick={handleResetData}
            >
              {confirmReset ? 'Click again to confirm' : 'Reset to Default'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Data Backup Modal */}
      <DataBackupModal 
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
