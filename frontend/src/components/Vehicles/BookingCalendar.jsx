import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarOverlay.css';

const localizer = momentLocalizer(moment);

const BookingCalendar = ({ events, onSelectSlot }) => {
    return (
        <div className="h-[400px] bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl overflow-hidden p-4">
            <h3 className="text-xl font-bold mb-4">Availability Calendar</h3>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '80%' }}
                selectable
                onSelectSlot={onSelectSlot}
                eventPropGetter={(event) => ({
                    className: event.status === 'Booked' ? 'bg-red-500' : 'bg-green-500',
                })}
            />
        </div>
    );
};

export default BookingCalendar;
