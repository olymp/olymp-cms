import React, { Component } from 'react';
import { createComponent } from 'react-fela';
import { get } from 'lodash';
import { compose, withPropsOnChange } from 'recompose';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, compareAsc } from 'date-fns';
import moment from 'moment';

BigCalendar.momentLocalizer(moment);

const min = new Date(0, 0, 0, 7, 0, 0, 0);
const max = new Date(0, 0, 0, 22, 0, 0, 0);

const EventAgenda = onClick => ({ event }) => (
  <div onClick={() => onClick(event)} style={{ cursor: 'pointer' }}>
    <h4>{event.title}</h4>
    {event.desc}
  </div>
);

const Calendar = createComponent(
  ({ theme }) => ({
    '& .rbc-event': {
      backgroundColor: theme.color,
      borderRadius: 0,
      marginX: theme.space1,
      onHover: {
        opacity: 0.67
      }
    }
  }),
  p => <BigCalendar {...p} />,
  p => Object.keys(p)
);

const enhance = compose(
  withPropsOnChange(['items', 'collection'], ({ items, collection }) => {
    const isEvent = !!get(collection, 'mapping.event');
    const event = get(collection, 'mapping.event', {});

    const events = (items || []).map(item => ({
      id: item.id,
      title: item.list.title,
      desc: item.list.subtitle,
      allDay: event.allDay,
      start: new Date(event.start),
      end: isEvent ? new Date(event.end) : new Date(event.end)
    }));

    return { events };
  })
);

@enhance
export default class CalendarView extends Component {
  render() {
    const { collection, events, updateQuery } = this.props;
    const isEvent = !!get(collection, 'mapping.event');
    const hasEnd = !!get(collection, 'mapping.event.end');

    return (
      <Calendar
        selectable
        events={events}
        messages={{
          allDay: 'Ganztägig',
          previous: 'Zurück',
          next: 'Vor',
          today: 'Heute',
          month: 'Monat',
          week: 'Woche',
          day: 'Tag',
          agenda: 'Agenda',
          date: 'Datum',
          time: 'Zeit',
          event: collection.label
          // showMore: Function
        }}
        components={{
          agenda: {
            event: EventAgenda(event =>
              updateQuery({ [`@${collection.name}`]: event.id })
            )
          }
        }}
        formats={{
          dateFormat: 'DD.',
          dayFormat: 'dd, DD.MM',
          dayHeaderFormat: 'dddd, DD. MMMM YYYY',
          agendaDateFormat: 'dd, DD.MM.YYYY',
          agendaTimeRangeFormat: ({ start, end }) =>
            compareAsc(start, end)
              ? `${format(start, 'HH:mm')} bis ${format(end, 'HH:mm')}`
              : format(start, 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }) =>
            compareAsc(start, end)
              ? `${format(start, 'HH:mm')} bis ${format(end, 'HH:mm')}`
              : format(start, 'HH:mm')
        }}
        min={min}
        max={max}
        onSelectEvent={event =>
          updateQuery({ [`@${collection.name}`]: event.id })
        }
        onSelectSlot={slotInfo => {
          const query = {
            [`@${collection.name}`]: 'new'
          };

          if (isEvent) {
            query.start = slotInfo.start;
          }

          if (hasEnd) {
            query.end = slotInfo.end;
          }

          updateQuery(query);
        }}
      />
    );
  }
}
