import React, { useState, useEffect } from 'react';
import { Star, User, Calendar } from 'lucide-react';

const ReviewList = ({ restaurantId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

    const fetchReviews = async (pageNum) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/reviews/restaurant/${restaurantId}?pageNumber=${pageNum}`);
            const data = await response.json();

            if (pageNum === 1) {
                setReviews(data.reviews);
            } else {
                setReviews(prev => [...prev, ...data.reviews]);
            }

            setTotalPages(data.pages);
            setStats({
                averageRating: data.averageRating,
                totalReviews: data.totalReviews
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchReviews(1);
        }
    }, [restaurantId]);

    const loadMore = () => {
        if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReviews(nextPage);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={`${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
            />
        ));
    };

    if (loading && page === 1) {
        return <div className="text-center py-8">Loading reviews...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Reviews & Ratings</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                        <span className="text-green-700 font-bold mr-1">{stats.averageRating || 0}</span>
                        <Star size={16} className="text-green-700 fill-green-700" />
                    </div>
                    <span className="text-gray-500 text-sm">({stats.totalReviews} reviews)</span>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review!
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {review.user?.profileImage ? (
                                            <img
                                                src={review.user.profileImage}
                                                alt={review.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">
                                            {review.user?.name || 'Anonymous User'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {review.isVerifiedPurchase && (
                                                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                    Verified Purchase
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                                {review.comment}
                            </p>

                            {review.photos && review.photos.length > 0 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                    {review.photos.map((photo, idx) => (
                                        <img
                                            key={idx}
                                            src={photo}
                                            alt={`Review photo ${idx + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                        />
                                    ))}
                                </div>
                            )}

                            {review.reply && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Response from Restaurant</p>
                                    <p className="text-sm text-gray-600">{review.reply.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatDate(review.reply.repliedAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {page < totalPages && (
                <div className="mt-6 text-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors text-sm font-medium"
                    >
                        {loading ? 'Loading...' : 'Show More Reviews'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
