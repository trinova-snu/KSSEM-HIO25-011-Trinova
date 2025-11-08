import React from 'react';
import { Notification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';
import { BellIcon, MegaphoneIcon } from './icons';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications }) => {
    const { t } = useLanguage();
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('notifications.title')}>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {notifications.length === 0 ? (
                    <div className="text-center py-10 px-6 bg-dark-bg rounded-lg flex flex-col items-center border border-border-color">
                        <BellIcon className="w-10 h-10 text-secondary mb-3"/>
                        <p className="text-text-dark">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                             <div key={notif.id} className={`p-4 rounded-lg border flex gap-4 ${notif.read ? 'bg-dark-bg/50 border-border-color/50 opacity-70' : 'bg-dark-bg border-border-color'}`}>
                                <div className="mt-1">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                                        <MegaphoneIcon className="h-5 w-5" />
                                    </span>
                                </div>
                                <div>
                                    <p className={`font-semibold text-text-light ${!notif.read && 'text-primary'}`}>{notif.title}</p>
                                    <p className="text-sm text-text-dark">{notif.message}</p>
                                    <p className="text-xs text-text-dark/70 mt-1">{timeAgo(notif.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NotificationsModal;