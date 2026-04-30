import React, { useState } from 'react';
import { Button } from '../../ui/Button';
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
        <div className="fixed inset-0 z-1100 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Оставить отзыв</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={28}
                                    className={`cursor-pointer transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
                        <textarea
                            className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-violet-500 text-sm resize-none"
                            rows={4}
                            placeholder="Напишите пару слов о работе с этим участником..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" className="px-4 py-2 rounded-xl bg-gray-100 font-semibold text-gray-600" onClick={onClose}>
                            Отмена
                        </button>
                        <Button type="submit" isLoading={isLoading} className="px-6 py-2 rounded-xl bg-violet-600 text-white">
                            Отправить
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};