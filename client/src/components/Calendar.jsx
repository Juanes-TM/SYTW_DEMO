import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({ events, onSelectSlot }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <Calendar
        localizer={localizer}
        events={events}
        selectable
        defaultView="week"
        style={{ height: 500 }}
        onSelectSlot={onSelectSlot}
      />
    </div>
  );
}
