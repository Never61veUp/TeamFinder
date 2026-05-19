import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 14 }) => {
    return (
        <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={
                        star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200 fill-gray-200'
                    }
                />
            ))}
        </div>
    );
};