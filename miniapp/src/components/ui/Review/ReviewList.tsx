import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '../../../services/reviewService';
import type { Review } from '../../../types/api';

interface ReviewListProps {
    userId?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                let data: Review[];
                if (userId) {
                    data = await reviewService.getByProfileId(userId);
                } else {
                    data = await reviewService.getMy();
                }
                setReviews(data);
            } catch (err) {
                console.error('Ошибка при загрузке отзывов:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [userId]);

    if (isLoading) return <div className="text-sm text-slate-500 py-4 animate-pulse">Загрузка отзывов...</div>;
    if (reviews.length === 0) return <div className="text-sm text-slate-400 py-4 italic">Отзывов пока нет</div>;

    return (
        <section className="w-full flex flex-col items-left mt-6">
            <h2 className="font-bold text-slate-900 mb-4 text-left text-sm tracking-widest uppercase">
                Отзывы
            </h2>
            <div className="space-y-3">
                {reviews.map(review => (
                    <div key={review.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-slate-800">{review.reviewerName}</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        size={14}
                                        className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}
                                    />
                                ))}
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-slate-600 leading-relaxed mb-2">{review.comment}</p>
                        )}
                        <div className="text-xs text-slate-400 text-right font-semibold">
                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};