import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, isValid as dateFnsIsValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import axios from 'axios'; 
import './CalendarTable.css';

function CalendarTable() {
    const navigate = useNavigate();
    const { year, month } = useParams();

    const currentDate = useMemo(() => {
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    }, [year, month]);

    const eventViewRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isStatic, setIsStatic] = useState(false); // Added state for static content

    useEffect(() => {
        const fetchEvents = async () => {
            const mockUrl = 'https://run.mocky.io/v3/982a30b9-e6c6-49c4-8598-78c4ecca9790';
            try {
                const response = await axios.get(mockUrl);
                setEvents(response.data); // axios wraps the response data inside a data property
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
        } else {
            // Check if it's a different month, and hide static content if needed
            setIsStatic(false);
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
        setIsStatic(false);
        navigate(`/${newDate.getFullYear()}/${newDate.getMonth() + 1}`);
    };

    const handleEventClick = (event, e) => {
        e.stopPropagation();
        setSelectedEvent(event);
    };

    const renderSelectedEventRow = () => {
        if (selectedEvent && !isStatic) { // Hide content when isStatic is true
            return (
                <tr key="selected-event-row">
                    <td colSpan="7">
                        <div ref={eventViewRef} className="event-view" style={{
                            backgroundImage: `url(${selectedEvent.imageFilenameFull})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '300px',
                            width: '95%',
                            color: '#FFFFFF',
                            padding: '20px',
                        }}>
                            <h3 style={{ fontWeight: 'bold', padding: '10px' }}>{selectedEvent.title}</h3>
                            <p className='event-summary-background' style={{ fontWeight: 'unset', margin: '10px', padding: '0px' }}>{selectedEvent.summary}</p>
                            <p style={{ fontWeight: 'bold', padding: '6px' }}>{format(new Date(selectedEvent.launchDate), 'PPP')}</p>
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
