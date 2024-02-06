import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, isValid as dateFnsIsValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import './CalendarTable.css';

function CalendarTable() {
    const navigate = useNavigate();
    const { year, month } = useParams();

    // Memoize currentDate to prevent it from being recreated on every render
    const currentDate = useMemo(() => {
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    }, [year, month]);
    
    const eventViewRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            const mockUrl = 'https://run.mocky.io/v3/555e0256-3863-48c3-ae92-f3f3fbd3b290';
            try {
                const response = await fetch(mockUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        if (!dateFnsIsValid(currentDate) || currentDate.getFullYear() < 1000 || currentDate.getFullYear() > 9999 || currentDate.getMonth() < 0 || currentDate.getMonth() > 11) {
            const now = new Date();
            navigate(`/${now.getFullYear()}/${now.getMonth() + 1}`);
        }
    }, [navigate, currentDate]);

    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (eventViewRef.current && !eventViewRef.current.contains(e.target)) {
                setSelectedEvent(null);
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const navigateToMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset);
        navigate(`/${newDate.getFullYear()}/${newDate.getMonth() + 1}`);
    };

    const handleEventClick = (event, e) => {
        e.stopPropagation();
        setSelectedEvent(event);
    };

    const renderSelectedEventRow = () => {
        if (selectedEvent) {
            return (
                <tr key="selected-event-row">
                    <td colSpan="7">
                        <div className="event-view" style={{
                            backgroundImage: `url(${selectedEvent.imageFilenameFull})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '300px',
                            width: '95%',
                            color: '#FFFFFF',
                            padding: '20px',
                        }}>
                            <h3>{selectedEvent.title}</h3>
                            <p style={{ fontWeight: 'bold' }}>{format(new Date(selectedEvent.launchDate), 'PPP')}</p>
                            <p className='event-summary-background' style={{ fontWeight: 'bold' }}>{selectedEvent.summary}</p>
                            <button className="learn-more-btn" style={{ fontWeight: 'bold' }} onClick={() => window.open(selectedEvent.learnMoreLink, '_blank', 'noopener,noreferrer')}>Learn More</button>
                            <button className="preorder-btn" style={{ fontWeight: 'bold' }} onClick={() => window.open(selectedEvent.purchaseLink, '_blank', 'noopener,noreferrer')}>Pre-Order Now</button>
                        </div>
                    </td>
                </tr>
            );
        }
        return null;
    };

    const renderDays = () => {
        const startDay = startOfMonth(currentDate);
        const endDay = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: startDay, end: endDay });
        let weeks = [];
        let week = [];
        let daysInWeek = 0;

        for (let i = 0; i < startDay.getDay(); i++) {
            week.push(<td key={`padding-start-${i}`} className="calendar-day empty"></td>);
            daysInWeek++;
        }

        days.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = events.filter(event => format(new Date(event.launchDate), 'yyyy-MM-dd') === dayKey);
            week.push(
                <td key={dayKey} className="calendar-day" onClick={(e) => handleEventClick(dayEvents[0], e)}>
                    <div className={`day-card ${dayEvents.length ? 'has-event' : ''}`} style={dayEvents.length ? { backgroundImage: `url(${dayEvents[0].imageFilenameThumb})` } : {}}>
                        <div className="date">{format(day, 'd')}</div>
                    </div>
                </td>
            );
            daysInWeek++;

            if (daysInWeek % 7 === 0 || day === days[days.length - 1]) {
                weeks.push(<tr key={`week-${weeks.length}`}>{week}</tr>);
                week = [];
                daysInWeek = 0;
            }
        });

        const middleIndex = Math.floor(weeks.length / 2);
        weeks.splice(middleIndex, 0, renderSelectedEventRow());

        return weeks;
    };

    return (
        <div className="calendar-container">
            <div className="header">
                <button onClick={() => navigateToMonth(-1)}>&lt;</button>
                <h2>{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={() => navigateToMonth(1)}>&gt;</button>
            </div>
            <table>
                <thead>
                    <tr>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => <th key={day}>{day}</th>)}</tr>
                </thead>
                <tbody>{renderDays()}</tbody>
            </table>
        </div>
    );
}

export default CalendarTable;