import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {reviewService} from "../../../services/reviewService.ts";
import type {Review} from "../../../types/api.ts";

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
                    console.log(data)
                } else {
                    data = await reviewService.getMy();
                }

                setReviews(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [userId]);

    if (isLoading) return <div className="text-sm text-gray-500 py-4">Загрузка отзывов...</div>;
    if (reviews.length === 0) return <div className="text-sm text-gray-500 py-4">Отзывов пока нет</div>;

    return (
        <section className="w-full flex flex-col items-left mt-6">
            <h2 className="font-bold text-[#333] mb-4 text-left text-[16px] tracking-widest uppercase">
                Отзывы
            </h2>
            <div className="space-y-3">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm text-slate-800">{review.reviewerName}</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        size={14}
                                        className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                                    />
                                ))}
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">{review.comment}</p>
                        )}
                        <div className="text-xs text-gray-400 text-right font-medium">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};