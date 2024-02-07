import { useState, useEffect } from 'react';

function useFetchEvents(url) {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                setError(error);
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [url]);

    return { events, error, isLoading };
}

export default useFetchEvents;
