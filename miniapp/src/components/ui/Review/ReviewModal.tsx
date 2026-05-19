import React, { useState } from 'react';
import { Button } from '../Button';
import { httpClient } from '../../../lib/http-client';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
    teamId: string;
    targetProfileId: string;
    onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ teamId, targetProfileId, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Пожалуйста, поставьте оценку от 1 до 5');
            return;
        }

        setIsLoading(true);
        try {
            await httpClient.post('/reviews', {
                teamId,
                targetProfileId,
                rating,
                comment
            });
            alert('Отзыв успешно отправлен!');
            onClose();
        } catch (error) {
            console.error('Ошибка при отправке отзыва', error);
            alert('Не удалось отправить отзыв');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-extrabold text-xl text-slate-900">Оставить отзыв</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1.5">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Оценка</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={32}
                                    className={`cursor-pointer transition-all hover:scale-110 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-50'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Комментарий</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none transition-all"
                            rows={4}
                            placeholder="Напишите пару слов о работе с этим участником..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" className="px-5 font-bold text-slate-500" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button type="submit" isLoading={isLoading} className="px-6 font-bold shadow-md shadow-violet-200">
                            Отправить
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};