import { useState, useRef } from 'react';
import './DatePicker.css';

// Constants for months and weekdays
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLUMNS = 4;
const ROWS = 3;
const CALENDAR_PADDING = 12;
const CALENDAR_WIDTH = CALENDAR_PADDING + 276 + CALENDAR_PADDING;

// View mode constants
const VIEW_MODES = {
  DAY: 'day-picker',
  MONTH: 'month-picker',
  YEAR: 'year-picker',
  // Day transitions
  DAY_TO_MONTH: 'day-to-month-picker',
  DAY_TO_PREV_MONTH: 'day-to-prev-month-picker',
  DAY_TO_NEXT_MONTH: 'day-to-next-month-picker',
  // Month transitions
  MONTH_TO_DAY: 'month-to-day-picker',
  MONTH_TO_YEAR: 'month-to-year-picker',
  MONTH_TO_PREV_YEAR: 'month-to-prev-month-picker',
  MONTH_TO_NEXT_YEAR: 'month-to-next-month-picker',
  // Year transitions
  YEAR_TO_MONTH: 'year-to-month-picker',
  YEAR_TO_PREV_YEARS: 'year-to-prev-12-years-picker',
  YEAR_TO_NEXT_YEARS: 'year-to-next-12-years-picker',
};

export default function DatePicker({ selectedDate = null, showHiddenOverlay = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [viewState, setViewState] = useState({
    gridNumber: 1,
    mode: VIEW_MODES.DAY,
    setMonth: new Date(),
    setYear: new Date(),
  });
  const calendarRef = useRef(null);
  const calendarBodyContainerRef = useRef(null);
  const [initialHeightSet, setInitialHeightSet] = useState(false);

  // Animation classes
  const ANIMATIONS = {
    SLIDE_LEFT: 'will-change-transform-and-opacity transition-grid-animate-slideLeft',
    SLIDE_RIGHT: 'will-change-transform-and-opacity transition-grid-animate-slideRight',
    MAIN_SLIDE_LEFT: 'will-change-transform-and-opacity main-grid-animate-slideLeft',
    MAIN_SLIDE_RIGHT: 'will-change-scale-and-opacity main-grid-animate-slideRight',
    CONTRACT: 'will-change-scale-and-opacity transition-grid-animate-contract',
    EXPAND: 'will-change-scale-and-opacity transition-grid-animate-expand',
    MAIN_CONTRACT: 'will-change-scale-and-opacity main-grid-animate-contract',
    MAIN_EXPAND: 'will-change-scale-and-opacity main-grid-animate-expand'
  };

  // ===== Helper Functions =====

  // Format date for display in the button
  const formatDisplayDate = (date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if we're in a transition that slides to previous
  const isPrevTransition = (mode) => {
    return [
      VIEW_MODES.DAY_TO_PREV_MONTH,
      VIEW_MODES.MONTH_TO_PREV_YEAR,
      VIEW_MODES.YEAR_TO_PREV_YEARS
    ].includes(mode);
  };

  // Check if we're in a transition that slides to next
  const isNextTransition = (mode) => {
    return [
      VIEW_MODES.DAY_TO_NEXT_MONTH,
      VIEW_MODES.MONTH_TO_NEXT_YEAR,
      VIEW_MODES.YEAR_TO_NEXT_YEARS
    ].includes(mode);
  };

  // Check if we're in a slide transition
  const isSlideTransition = (mode) => isPrevTransition(mode) || isNextTransition(mode);

  // Navigate to previous month/year
  const handlePrev = () => {
    switch (viewState?.mode) {
      case VIEW_MODES.DAY: {
        const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        setViewState((prev) => ({
          ...prev,
          mode: VIEW_MODES.DAY_TO_PREV_MONTH,
          setMonth: prevMonth,
        }));
        break;
      }
      case VIEW_MODES.MONTH: {
        const prevYear = new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1);
        setViewState((prev) => ({
          ...prev,
          mode: VIEW_MODES.MONTH_TO_PREV_YEAR,
          setYear: prevYear,
        }));
        break;
      }
      case VIEW_MODES.YEAR: {
        const prevYearGroup = new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1);
        setViewState((prev) => ({
          ...prev,
          mode: VIEW_MODES.YEAR_TO_PREV_YEARS,
          setYear: prevYearGroup,
        }));
        break;
      }
      default:
        break;
    }
  };

  // Navigate to next month/year
  const handleNext = () => {
    switch (viewState?.mode) {
      case VIEW_MODES.DAY: {
        const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        setViewState((prev) => ({
          ...prev,
          mode: VIEW_MODES.DAY_TO_NEXT_MONTH,
          setMonth: nextMonth,
        }));
        break;
      }
      case VIEW_MODES.MONTH: {
        const nextYear = new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1);
        setViewState((prev) => ({
          ...prev,
          mode: VIEW_MODES.MONTH_TO_NEXT_YEAR,
          setYear: nextYear,
        }));
        break;
      }
      case VIEW_MODES.YEAR: {
        const nextYear = new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1);
        setViewState((prev) => ({
          ...prev,
          mode: VIEW_MODES.YEAR_TO_NEXT_YEARS,
          setYear: nextYear,
        }));
        break;
      }
      default:
        break;
    }
  };

  // Get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  // Get day of week (0-6) of first day of month
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const getStartYear = (year) => year - (year % 12);

  const setClassNameForYearsGrid = () => {
    switch(viewState?.mode) {
      case VIEW_MODES.MONTH_TO_YEAR:
        return ` body-transition ${ANIMATIONS.CONTRACT}`;
      case VIEW_MODES.YEAR_TO_MONTH:
        return ` body-transition ${ANIMATIONS.EXPAND}`;
      case VIEW_MODES.YEAR_TO_PREV_YEARS:
        return ` body-transition ${ANIMATIONS.SLIDE_RIGHT}`;
      case VIEW_MODES.YEAR_TO_NEXT_YEARS:
        return ANIMATIONS.MAIN_SLIDE_LEFT;
    }

    return '';
  }

  const setClassNameForYearsTransitionGrid = () => {
    switch(viewState?.mode) {
      case VIEW_MODES.YEAR_TO_PREV_YEARS:
        return ANIMATIONS.MAIN_SLIDE_RIGHT;
      case VIEW_MODES.YEAR_TO_NEXT_YEARS:
        return `body-transition ${ANIMATIONS.SLIDE_LEFT}`;
    }

    return '';
  }

  const setClassNameForMonthsGrid = () => {
    switch (viewState?.mode) {
      case VIEW_MODES.DAY_TO_MONTH:
        return ` body-transition ${ANIMATIONS.CONTRACT}`;
      case VIEW_MODES.MONTH_TO_DAY:
        return ` body-transition ${ANIMATIONS.EXPAND}`;
      case VIEW_MODES.MONTH_TO_YEAR:
        return ANIMATIONS.MAIN_CONTRACT;
      case VIEW_MODES.YEAR_TO_MONTH:
        return ANIMATIONS.MAIN_EXPAND;
      case VIEW_MODES.MONTH_TO_PREV_YEAR:
        return ANIMATIONS.SLIDE_RIGHT;
      case VIEW_MODES.MONTH_TO_NEXT_YEAR:
        return ANIMATIONS.MAIN_SLIDE_LEFT;
    }

    return '';
  }

  const setClassNameForMonthsTransitionGrid = () => {
    switch(viewState?.mode) {
      case VIEW_MODES.MONTH_TO_PREV_YEAR:
        return ` body-transition ${ANIMATIONS.MAIN_SLIDE_RIGHT}`;
      case VIEW_MODES.MONTH_TO_NEXT_YEAR:
        return ` body-transition ${ANIMATIONS.SLIDE_LEFT}`;
    }

    return '';
  }

  const setClassNameForDaysGrid = () => {
    switch (viewState?.mode) {
      case VIEW_MODES.DAY_TO_MONTH:
        return ANIMATIONS.MAIN_CONTRACT;
      case VIEW_MODES.MONTH_TO_DAY:
        return ANIMATIONS.MAIN_EXPAND;
      case VIEW_MODES.DAY_TO_PREV_MONTH:
        return ANIMATIONS.SLIDE_RIGHT;
      case VIEW_MODES.DAY_TO_NEXT_MONTH:
        return ANIMATIONS.MAIN_SLIDE_LEFT;
    }

    return '';
  }

  const setClassNameForDaysTransitionGrid = () => {
    switch (viewState?.mode) {
      case VIEW_MODES.DAY_TO_PREV_MONTH:
        return ` body-transition ${ANIMATIONS.MAIN_SLIDE_RIGHT}`;
      case VIEW_MODES.DAY_TO_NEXT_MONTH:
        return ` body-transition ${ANIMATIONS.SLIDE_LEFT}`;
    }

    return '';
  }

  const setClassNameForTransitionHeader = () => {
    if (isPrevTransition(viewState?.mode)) {
      return ANIMATIONS.MAIN_SLIDE_RIGHT;
    }

    if (isNextTransition(viewState?.mode)) {
      return `header-transition ${ANIMATIONS.SLIDE_LEFT}`;
    }

    return '';
  }

  const setClassNameForHeader = () => {
    if (isPrevTransition(viewState?.mode)) {
      return ` header-transition ${ANIMATIONS.SLIDE_RIGHT}`;
    }

    if (isNextTransition(viewState?.mode)) {
      return ANIMATIONS.MAIN_SLIDE_LEFT;
    }

    return '';
  }

  const setClassNameForNavigatorButtons = () => {
    let retClass = 'navigator-button';

    if (isSlideTransition(viewState?.mode)) {
      retClass += ' hidden';
    }

    return retClass;
  }

  const setStyle = () => {
    if (!calendarBodyContainerRef || !calendarBodyContainerRef.current) {
      return {};
    }

    const gridNumber = viewState?.gridNumber || 1;
    const columnIndex = (gridNumber - 1) % COLUMNS; // 0-based index representing the column
    const shrinkScale = (CALENDAR_WIDTH/COLUMNS)/CALENDAR_WIDTH;

    /* (pixelOffset / (1 - scale)); */
    const pixelXAsixOffset = ((CALENDAR_WIDTH - CALENDAR_PADDING - CALENDAR_PADDING) / COLUMNS) * columnIndex;
    const transformOriginX = (pixelXAsixOffset / (1 - shrinkScale));

    const rect = calendarBodyContainerRef.current.getBoundingClientRect();
    const shrinkHeight = rect.height * shrinkScale;
    const pixelGridYAxisOffset = ((rect.height/ROWS) - (shrinkHeight)) / 2;

    //there are 3 rows
    const rowIndex = Math.floor((gridNumber - 1) / COLUMNS); // 0-based index representing the row
    const pixelYAsixOffset = pixelGridYAxisOffset + (rect.height / ROWS) * rowIndex;
    const transformOriginY = (pixelYAsixOffset / (1 - shrinkScale));

    return {
      transformOrigin: `${transformOriginX}px ${transformOriginY}px`,
    }
  }

  // ===== Handler Functions =====

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(newDate);
    setIsOpen(false);
  };

  const handleMonthClick = (month) => {
    if (!initialHeightSet && calendarRef && calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      calendarRef.current.style.height = `${rect.height-2}px`;
      setInitialHeightSet(true);
    }
    setViewState((prev) => ({
      ...prev,
      gridNumber: month + 1,
      mode: VIEW_MODES.DAY_TO_MONTH,
    }));
  };

  const handleYearClick = (year) => {
    setViewState((prev) => ({
      ...prev,
      gridNumber: year - getStartYear(year) + 1,
      mode: VIEW_MODES.MONTH_TO_YEAR,
    }));
    setViewDate(new Date(year, viewDate.getMonth(), 1));
  };

  // Toggle calendar open/closed
  const handleToggleCalendar = () => {
    setIsOpen(!isOpen);
    setViewState((prev) => ({
      ...prev,
      mode: VIEW_MODES.DAY,
    }));
  };

  // Generate calendar grid to show 12 months of the year
  const renderCalendarMonthsGrid = (date = viewDate) => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const isSelected = date &&  date.getMonth() === month &&  date.getFullYear() === viewDate.getFullYear();
      months.push(
        <div
          key={`month-${month}`}
          data-index={month+1}
          className={`month ${isSelected ? 'selected' : ''}`}
          onClick={() => {
            const newDate = new Date(viewDate.getFullYear(), month, 1);
            setViewDate(newDate);
            setViewState((prev) => ({
              ...prev,
              gridNumber: month + 1,
              mode: VIEW_MODES.MONTH_TO_DAY,
            }));
          }}
        >
          {MONTHS_SHORT[month]}
        </div>
      );
    }
    return months;
  }

  // ===== Render Functions =====

  // Generate calendar grid to show days of the month
  const renderCalendarDaysGrid = (date = viewDate) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const offset = (firstDayOfMonth + 6) % 7; // Adjust so Monday is the first day
    const days = [];

    // Add empty cells for days before the first day (based on Monday as the first day)
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="day empty">0</div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        currentDate &&
        currentDate.getDate() === day &&
        currentDate.getMonth() === month &&
        currentDate.getFullYear() === year;
      days.push(
        <div
          key={`day-${day}`}
          className={`day ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </div>
      );
    }

    // Add empty cells to complete the rows
    const totalCells = Math.ceil((daysInMonth + offset) / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push(<div key={`empty-${i}`} className="day empty">0</div>);
    }

    // Ensure grid has 42 cells (6 rows)
    while (days.length < 42) {
      const i = days.length;
      days.push(<div key={`empty-${i}`} className="day empty">0</div>);
    }

    return days;
  };

  // Generate calendar grid to show 12 years
  const renderCalendarYearsGrid = (date = viewDate) => {
    const currentYear = date.getFullYear();
    const startYear = getStartYear(currentYear);
    const years = [];

    for (let i = 0; i < 12; i++) {
      const year = startYear + i;
      const isSelected = currentDate && currentDate.getFullYear() === year;
      years.push(
        <div
          key={`year-${year}`}
          className={`year ${isSelected ? 'selected' : ''}`}
          data-index={i+1}
          onClick={() => {
            const newDate = new Date(year, date.getMonth(), 1);
            setViewDate(newDate);
            setViewState((prev) => ({
              ...prev,
              gridNumber: i + 1,
              mode: VIEW_MODES.YEAR_TO_MONTH,
            }));
          }}
        >
          {year}
        </div>
      );
    }

    return years;
  };

  const renderPrevButton = () => (
    <button className={setClassNameForNavigatorButtons()} onClick={handlePrev}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6"></path>
      </svg>
    </button>
  )

  const renderNextButton = () => (
    <button className={setClassNameForNavigatorButtons()} onClick={handleNext}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6"></path>
      </svg>
    </button>
  )

  return (
    <div className="date-picker-main">
      <button className="date-button" onClick={handleToggleCalendar}>
        {formatDisplayDate(currentDate)}
      </button>
      {isOpen && (
        <div className={`calendar ${showHiddenOverlay ? 'showHiddenOverlay' : 'hideHiddenOverlay'}`} ref={calendarRef}>
          <div className="calendar-header-container">
            <div className={`calendar-header ${setClassNameForHeader()}`}>
              <div className="month-navigator">
                {renderPrevButton()}
                <div>
                  {(
                    viewState?.mode === VIEW_MODES.DAY ||
                    viewState?.mode === VIEW_MODES.DAY_TO_PREV_MONTH ||
                    viewState?.mode === VIEW_MODES.DAY_TO_NEXT_MONTH
                  ) && (
                    <button className="navigator-title" onClick={(e) => {
                      handleMonthClick(viewDate.getMonth())
                    }}>
                      {viewDate.toLocaleDateString('en-US', { month: 'long' })}
                      {' '}
                      {viewDate.getFullYear()}
                    </button>
                  )}
                  {(
                    viewState?.mode === VIEW_MODES.MONTH ||
                    viewState?.mode === VIEW_MODES.MONTH_TO_PREV_YEAR ||
                    viewState?.mode === VIEW_MODES.MONTH_TO_NEXT_YEAR
                  ) && (
                    <button className="navigator-title" onClick={(e) => {
                      handleYearClick(viewDate.getFullYear());
                    }}>
                      {viewDate.getFullYear()}
                    </button>
                  )}
                  {(
                    viewState?.mode === VIEW_MODES.YEAR ||
                    viewState?.mode === VIEW_MODES.YEAR_TO_PREV_YEARS ||
                    viewState?.mode === VIEW_MODES.YEAR_TO_NEXT_YEARS
                  ) && (
                    <button className="navigator-title disabled">
                      {getStartYear(viewDate.getFullYear())}
                      {' '}
                      &ndash;
                      {' '}
                      {getStartYear(viewDate.getFullYear()) + 11}
                    </button>
                  )}
                </div>
                {renderNextButton()}
              </div>
            </div>
            {isSlideTransition(viewState?.mode) && (
              <div className={`calendar-header ${setClassNameForTransitionHeader()}`}>
                <div className="month-navigator">
                  {renderPrevButton()}
                  <div>
                    {(
                      viewState?.mode === VIEW_MODES.DAY_TO_PREV_MONTH ||
                      viewState?.mode === VIEW_MODES.DAY_TO_NEXT_MONTH
                    ) && (
                      <button className="navigator-title">
                        {viewState?.setMonth?.toLocaleDateString('en-US', { month: 'long' })}
                        {' '}
                        {viewState?.setMonth?.getFullYear()}
                      </button>
                    )}
                    {(
                      viewState?.mode === VIEW_MODES.MONTH_TO_PREV_YEAR ||
                      viewState?.mode === VIEW_MODES.MONTH_TO_NEXT_YEAR
                    ) && (
                      <button className="navigator-title">
                        {viewState?.setYear?.getFullYear()}
                      </button>
                    )}
                    {(
                      viewState?.mode === VIEW_MODES.YEAR_TO_PREV_YEARS ||
                      viewState?.mode === VIEW_MODES.YEAR_TO_NEXT_YEARS
                    ) && (
                      <button className="navigator-title">
                        {getStartYear(viewState?.setYear?.getFullYear())}
                        {' '}
                        &ndash;
                        {' '}
                        {getStartYear(viewState?.setYear?.getFullYear()) + 11}
                      </button>
                    )}
                  </div>
                  {renderNextButton()}
                </div>
              </div>
            )}
          </div>
          <div className="calendar-body-container" ref={calendarBodyContainerRef}>
            {(
              viewState?.mode === VIEW_MODES.YEAR ||
              viewState?.mode === VIEW_MODES.MONTH_TO_YEAR ||
              viewState?.mode === VIEW_MODES.YEAR_TO_MONTH ||
              viewState?.mode === VIEW_MODES.YEAR_TO_PREV_YEARS ||
              viewState?.mode === VIEW_MODES.YEAR_TO_NEXT_YEARS
            ) && (
              <div
                className={`years-grid-container ${setClassNameForYearsGrid()}`}
                style={setStyle()}
                onAnimationEnd={() => {
                  let toMode = viewState?.mode;
                  if (viewState?.mode === VIEW_MODES.MONTH_TO_YEAR) {
                    toMode = VIEW_MODES.YEAR;
                  } else if (viewState?.mode === VIEW_MODES.YEAR_TO_MONTH) {
                    toMode = VIEW_MODES.MONTH;
                  } else if (viewState?.mode === VIEW_MODES.YEAR_TO_PREV_YEARS) {
                    setViewDate(viewState?.setYear);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.YEAR,
                    }));
                    return;
                  } else if (viewState?.mode === VIEW_MODES.YEAR_TO_NEXT_YEARS) {
                    setViewDate(viewState?.setYear);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.YEAR,
                    }));
                    return;
                  }
                  setViewState((prev) => ({
                    ...prev,
                    mode: toMode,
                  }));
                }
              }>
                {renderCalendarYearsGrid()}
              </div>
            )}
            {(
              viewState?.mode === VIEW_MODES.YEAR_TO_PREV_YEARS ||
              viewState?.mode === VIEW_MODES.YEAR_TO_NEXT_YEARS
            ) && (
              <div
                className={`years-grid-container ${setClassNameForYearsTransitionGrid()}`}
                onAnimationEnd={() => {
                  let toMode = viewState?.mode;
                  if (viewState?.mode === VIEW_MODES.YEAR_TO_MONTH) {
                    toMode = VIEW_MODES.MONTH;
                  } else if (viewState?.mode === VIEW_MODES.YEAR_TO_PREV_YEARS) {
                    setViewDate(viewState?.setYear);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.YEAR,
                    }));
                    return;
                  } else if (viewState?.mode === VIEW_MODES.YEAR_TO_NEXT_YEARS) {
                    setViewDate(viewState?.setYear);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.YEAR,
                    }));
                    return;
                  }
                  setViewState((prev) => ({
                    ...prev,
                    mode: toMode,
                  }));
                }
              }>
                {renderCalendarYearsGrid(viewState?.setYear)}
              </div>
            )}
            {(
              viewState?.mode === VIEW_MODES.MONTH ||
              viewState?.mode === VIEW_MODES.MONTH_TO_DAY ||
              viewState?.mode === VIEW_MODES.DAY_TO_MONTH ||
              viewState?.mode === VIEW_MODES.MONTH_TO_YEAR ||
              viewState?.mode === VIEW_MODES.YEAR_TO_MONTH ||
              viewState?.mode === VIEW_MODES.MONTH_TO_PREV_YEAR ||
              viewState?.mode === VIEW_MODES.MONTH_TO_NEXT_YEAR
            ) && (
              <div
                className={`months-grid-container ${setClassNameForMonthsGrid()}`}
                style={setStyle()}
                onAnimationEnd={() => {
                  let toMode = viewState?.mode;
                  if (viewState?.mode === VIEW_MODES.YEAR_TO_MONTH) {
                    toMode = VIEW_MODES.MONTH;
                  } else if (viewState?.mode === VIEW_MODES.MONTH_TO_YEAR) {
                    toMode = VIEW_MODES.YEAR;
                  } else if (viewState?.mode === VIEW_MODES.MONTH_TO_DAY) {
                    toMode = VIEW_MODES.DAY;
                  } else if (viewState?.mode === VIEW_MODES.DAY_TO_MONTH) {
                    toMode = VIEW_MODES.MONTH;
                  } else if (viewState?.mode === VIEW_MODES.MONTH_TO_PREV_YEAR) {
                    setViewDate(viewState?.setYear);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.MONTH,
                    }));
                    return;
                  } else if (viewState?.mode === VIEW_MODES.MONTH_TO_NEXT_YEAR) {
                    setViewDate(viewState?.setYear);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.MONTH,
                    }));
                    return;
                  }
                  setViewState((prev) => ({
                    ...prev,
                    mode: toMode,
                  }));
                }
              }>
                {renderCalendarMonthsGrid()}
              </div>
            )}
            {(
              viewState?.mode === VIEW_MODES.MONTH_TO_PREV_YEAR ||
              viewState?.mode === VIEW_MODES.MONTH_TO_NEXT_YEAR
            ) && (
              <div className={`months-grid-container ${setClassNameForMonthsTransitionGrid()}`}>
                {renderCalendarMonthsGrid(viewState?.setYear)}
              </div>
            )}
            {(
              viewState?.mode === VIEW_MODES.DAY ||
              viewState?.mode === VIEW_MODES.MONTH_TO_DAY ||
              viewState?.mode === VIEW_MODES.DAY_TO_MONTH ||
              viewState?.mode === VIEW_MODES.DAY_TO_PREV_MONTH ||
              viewState?.mode === VIEW_MODES.DAY_TO_NEXT_MONTH
            ) && (
              <div
                className={`days-grid-container ${setClassNameForDaysGrid()}`}
                style={setStyle()}
                onAnimationEnd={() => {
                  let toMode = viewState?.mode;
                  if (viewState?.mode === VIEW_MODES.MONTH_TO_DAY) {
                    toMode = VIEW_MODES.DAY;
                  } else if (viewState?.mode === VIEW_MODES.DAY_TO_MONTH) {
                    toMode = VIEW_MODES.MONTH;
                  } else if (viewState?.mode === VIEW_MODES.DAY_TO_PREV_MONTH) {
                    setViewDate(viewState?.setMonth);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.DAY,
                    }));
                    return;
                  } else if (viewState?.mode === VIEW_MODES.DAY_TO_NEXT_MONTH) {
                    setViewDate(viewState?.setMonth);
                    setViewState((prev) => ({
                      ...prev,
                      mode: VIEW_MODES.DAY,
                    }));
                    return;
                  }
                  setViewState((prev) => ({
                    ...prev,
                    mode: toMode,
                  }));
                }
              }>
                <div className="weekdays">
                  {WEEKDAYS.map(day => <div key={day} className="weekday">{day}</div>)}
                </div>
                <div className="days-grid">
                  {renderCalendarDaysGrid()}
                </div>
              </div>
            )}
            {(
              viewState?.mode === VIEW_MODES.DAY_TO_PREV_MONTH ||
              viewState?.mode === VIEW_MODES.DAY_TO_NEXT_MONTH
            ) && (
              <div className={`days-grid-container ${setClassNameForDaysTransitionGrid()}`}>
                <div className="weekdays">
                  {WEEKDAYS.map(day => <div key={day} className="weekday">{day}</div>)}
                </div>
                <div className="days-grid">
                  {renderCalendarDaysGrid(viewState?.setMonth)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
