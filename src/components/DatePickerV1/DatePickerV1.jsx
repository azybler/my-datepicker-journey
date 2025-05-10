import { useState } from 'react';
import './DatePickerV1.css';

export default function DatePickerV1({ selectedDate = null, onChange = () => {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const [viewMode, setViewMode] = useState('day'); // day, month, year
    
    // Format date for display
    const formatDate = (date) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Navigate to previous month
    const prevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    // Navigate to next month
    const nextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // Navigate to previous year
    const prevYear = () => {
        setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    };

    // Navigate to next year
    const nextYear = () => {
        setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    };

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get day of week (0-6) of first day of month
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    // Handle date selection
    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setCurrentDate(newDate);
        onChange(newDate);
        setIsOpen(false);
    };

    // Generate calendar grid to show months of the year
    const generateCalendarMonthsGrid = () => {
        const months = [];
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr',
            'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ];
        for (let month = 0; month < 12; month++) {
            const isSelected = currentDate && 
                            currentDate.getMonth() === month && 
                            currentDate.getFullYear() === viewDate.getFullYear();
            months.push(
                <div 
                    key={`month-${month}`} 
                    className={`month-v1 ${isSelected ? 'selected-v1' : ''}`}
                    onClick={() => {
                        const newDate = new Date(viewDate.getFullYear(), month, 1);
                        setCurrentDate(newDate);
                        onChange(newDate);
                        setViewDate(newDate);
                        setViewMode('day');
                    }}
                >
                    {monthNames[month]}
                </div>
            );
        }
        return months;
    }

    // Generate calendar grid to show days of the month
    const generateCalendarDaysGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        
        const days = [];
        
        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="day-v1 empty-v1"></div>);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = currentDate && 
                            currentDate.getDate() === day && 
                            currentDate.getMonth() === month && 
                            currentDate.getFullYear() === year;
                            
            days.push(
                <div 
                    key={`day-${day}`} 
                    className={`day-v1 ${isSelected ? 'selected-v1' : ''}`}
                    onClick={() => handleDateSelect(day)}
                >
                    {day}
                </div>
            );
        }
        
        return days;
    };

    // Toggle calendar open/closed
    const toggleCalendar = () => {
        setIsOpen(!isOpen);
    };

    // Week days header
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleMonthClick = (month) => {
        // const newDate = new Date(viewDate.getFullYear(), month, 1);
        // setViewDate(newDate);
        console.log(month);
        setViewMode('month');
    };

    return (
        <div className="date-picker-v1">
            <button className="date-button-v1" onClick={toggleCalendar}>
                {formatDate(currentDate)}
            </button>
            {isOpen && (
                <div className="calendar-v1">
                    <div className="calendar-header-v1">
                        {/* <div className="year-navigator">
                            <button onClick={prevYear}>«</button>
                            <span>{viewDate.getFullYear()}</span>
                            <button onClick={nextYear}>»</button>
                        </div> */}
                        <div className="month-navigator-v1">
                            <button onClick={prevMonth}>‹</button>
                            <span>
                                {viewMode === 'day' && (
                                    <>
                                        <span onClick={(e) => {
                                            handleMonthClick(viewDate.toLocaleDateString('en-US', { month: 'long' }))
                                        }}>
                                            {viewDate.toLocaleDateString('en-US', { month: 'long' })}
                                        </span>
                                        {' '}
                                        <span>
                                            {viewDate.getFullYear()}
                                        </span>
                                    </>
                                )}
                                {viewMode === 'month' && (
                                    <span>
                                        {viewDate.getFullYear()}
                                    </span>
                                )}
                            </span>
                            <button onClick={nextMonth}>›</button>
                        </div>
                    </div>
                    {viewMode === 'day' && (
                        <>
                            <div className="weekdays-v1">
                                {weekDays.map(day => (
                                    <div key={day} className="weekday-v1">{day}</div>
                                ))}
                            </div>
                            <div className="days-grid-v1">
                                {generateCalendarDaysGrid()}
                            </div>
                        </>
                    )}
                    {viewMode === 'month' && (
                        <>
                            <div className="months-grid-v1">
                                {generateCalendarMonthsGrid()}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
