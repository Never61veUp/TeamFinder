import React from 'react';
import './notifications.css';

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Затемнение фона */}
            <div className={`sheet-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

            {/* Сама шторка */}
            <div className={`notifications-sheet ${isOpen ? 'open' : ''}`}>
                <div className="sheet-header">
                    <div className="sheet-drag-handle" />
                    <h3>Уведомления</h3>
                </div>

                <div className="sheet-content">


                    {/* Если пусто */}
                    {/* <div className="empty-state">Уведомлений пока нет</div> */}
                </div>
            </div>
        </>
    );
};