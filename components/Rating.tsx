import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import StarRating from './Stars';

interface RatingProps {
  rideId: number; 
}


const Rating: React.FC<RatingProps> = ({ rideId }) => {
  const [rating, setRating] = useState<number>(0);  
  const [comment, setComment] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const submitRating = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/rating`, { rideId, rating, comment });
      router.push('/');
    } catch (error) {
      console.error('Error submitting rating:', error);
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center h-[100vh]'>
      <div className='w-full max-w-md p-4 sm:p-6 lg:p-8'>
        <div className='text-center space-y-3 mt-[220px] overflow-y-hidden'>
          <h3>Hope you enjoyed your ride!</h3>
          <StarRating rating={rating} setRating={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comments here..."
            className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none"
          />
          <button 
            onClick={submitRating} 
            className='py-2 px-5 bg-black text-white rounded-md'
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Rate Your Driver'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rating;
