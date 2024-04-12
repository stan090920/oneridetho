import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Ride } from "@/components/Ride";

const Book = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; 
        if (!session) router.push('/auth/signup');
    }, [session, status, router]);

    if (status === 'loading') {
        return <div>Loading Map...</div>;
    }

    return (
        <div className="bg-black">
           <Ride />
        </div>
    );
}

export default Book;


