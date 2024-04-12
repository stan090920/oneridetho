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
  const router = useRouter();

  const submitRating = async () => {
    try {
      await axios.post(`/api/rating`, { rideId, rating, comment });
      router.push('/');
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className='relative h-[100vh] text-center space-y-3 mt-[220px] overflow-y-hidden'>
      <h3>Hope you enjoyed your ride!</h3>
      <StarRating rating={rating} setRating={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add your comments here..."
        className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none"
      />
      <button onClick={submitRating} className='py-2 pl-5 pr-5 bg-black text-white rounded-md'>Rate Your Driver</button>
    </div>
  );
};

export default Rating;
