import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, isValid as dateFnsIsValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import useFetchEvents from './useFetchEvents';
import './CalendarTable.css';

function CalendarTable() {
    const navigate = useNavigate();
    const { year, month } = useParams();

    const currentDate = useMemo(() => {
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    }, [year, month]);

    const eventViewRef = useRef(null);
    const { events, error, isLoading } = useFetchEvents('https://run.mocky.io/v3/8c886271-a8c6-43a7-a242-8ad1d3dccf39');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [isStatic, setIsStatic] = useState(false); 

    useEffect(() => {
        if (!dateFnsIsValid(currentDate)) {
            const now = new Date();
            navigate(`/${now.getFullYear()}/${now.getMonth() + 1}`);
        } else {
            setIsStatic(false);
        }
    }, [navigate, currentDate]);

    useEffect(() => {
        function handleDocumentClick(e) {
            if (!eventViewRef.current?.contains(e.target)) {
                setSelectedEvent(null);
                setImageLoading(true); 
            }
        }

        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, []);

    const navigateToMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset);
        navigate(`/${newDate.getFullYear()}/${newDate.getMonth() + 1}`);
    };

    const handleEventClick = (event, e) => {
        e.stopPropagation();
        setSelectedEvent(event);
    };
    
    useEffect(() => {
        if (selectedEvent) {
            const img = new Image();
            img.src = selectedEvent.imageFilenameFull;
            img.onload = () => setImageLoading(false);
        }
    }, [selectedEvent]);
    
    const renderButtons = () => {
        if (selectedEvent && !imageLoading) {
            return (
                <div className="buttons-container">
                    <button className="learn-more-btn" onClick={() => window.open(selectedEvent.learnMoreLink, '_blank', 'noopener,noreferrer')}>Learn More</button>
                    <button className="preorder-btn" onClick={() => window.open(selectedEvent.purchaseLink, '_blank', 'noopener,noreferrer')}>Pre-Order Now</button>
                </div>
            );
        }
        return null;
    };
    

    const renderSelectedEventRow = () => {
        if (selectedEvent && !isStatic) {
            return (
                <tr key="selected-event-row">
                    <td colSpan="7">
                        <div ref={eventViewRef} className={`event-view ${imageLoading ? 'loading-background' : ''}`} style={{backgroundImage: `url(${selectedEvent?.imageFilenameFull})`}}>
                            {imageLoading ? (
                                <div className="loading-spinner">Loading image...</div>
                            ) : (
                                <>
                                    <h3>{selectedEvent.title}</h3>
                                    <p>{selectedEvent.summary}</p>
                                    {renderButtons()}
                                </>
                            )}
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
            {isLoading && <div className="loading">Loading events...</div>}
            {error && <div className="error">Error fetching events: {error.message}</div>}
    
            {!isLoading && !error && (
                <>
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
                </>
            )}
        </div>
    );
}

export default CalendarTable;
