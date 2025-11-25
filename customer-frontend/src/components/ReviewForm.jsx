import React, { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';

const ReviewForm = ({ restaurantId, orderId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]);
    const [photoUrls, setPhotoUrls] = useState([]); // For preview
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoChange = (e) => {
        // In a real app, we would upload these to a server/cloud storage
        // For this demo, we'll just simulate it or use local object URLs if we were doing actual file upload
        // But since our backend expects strings (URLs), let's assume we have a way to get URLs.
        // For simplicity, I'll just ask for URLs in a text input or skip photo upload implementation details 
        // and just show UI for it.

        // Let's implement a simple URL input for now to match the backend expectation
    };

    const handleAddPhotoUrl = () => {
        const url = prompt('Enter photo URL:');
        if (url) {
            setPhotoUrls([...photoUrls, url]);
        }
    };

    const removePhoto = (index) => {
        setPhotoUrls(photoUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Get token from localStorage (assuming auth is implemented)
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    restaurantId,
                    orderId,
                    rating,
                    comment,
                    photos: photoUrls
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit review');
            }

            setRating(0);
            setComment('');
            setPhotoUrls([]);
            if (onReviewSubmitted) {
                onReviewSubmitted(data.data);
            }
            alert('Review submitted successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={24}
                                    className={`${star <= (hoverRating || rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none h-32"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                    <div className="flex flex-wrap gap-3">
                        {photoUrls.map((url, index) => (
                            <div key={index} className="relative w-20 h-20">
                                <img
                                    src={url}
                                    alt={`Preview ${index}`}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddPhotoUrl}
                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors"
                        >
                            <Upload size={20} />
                            <span className="text-xs mt-1">Add URL</span>
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
