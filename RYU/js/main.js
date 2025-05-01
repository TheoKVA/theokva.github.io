// =============
// CALENDAR ELEM
// =============

var containerEl = document.getElementById('external-events');
let calendarEl = document.getElementById('calendar');

// initialize the external events
// -----------------------------------------------------------------

new FullCalendar.Draggable(containerEl, {
    itemSelector: '.fc-event',
    eventData: function(eventEl) {
        return {
            title: eventEl.innerText,
        };
    }
});

// initialize the calendar
// -----------------------------------------------------------------
  
var calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
        left: 'today prev,next',
        center: 'title',
        right: 'resourceTimelineYear'
    },
    // aspectRatio: 1.6,
    initialView: 'resourceTimelineYear',
    nowIndicator: true,
    firstDay: 1, // Monday
    // initialDate: new Date(2025, 8, 3),
    locale: 'fr', // the initial locale. if not specified, uses the first one
    selectable: true,
    editable: true,
    droppable: true, // For external events
    resourceGroupField: 'type',
    resourceAreaColumns: [
        {
            field: 'title',
            headerContent: ''
        },
        {
            field: 'garantie',
            headerContent: '%',
            width: '50px',
            headerClassNames: 'css-center-text',
            cellClassNames: 'css-center-text',
        }
    ],
    resources: [
        { id: 'abe-1', type: 'Tache', title: 'ABE sujet 1' },
        { id: 'abe-2', type: 'Tache', title: 'ABE sujet 2' },
        { id: 'abe-3', type: 'Tache', title: 'ABE sujet 3' },
        { id: 'e', type: 'Personnel', title: 'Hector', garantie:'100'},
        { id: 'f', type: 'Personnel', title: 'Maurane', garantie:'60'},
        { id: 'g', type: 'Personnel', title: 'Théo', garantie:'80'}
    ],
    dateClick: function(info) {
        console.log(info);
    },
    eventClick: function(info) {
        console.log(info);
    },
    drop: function(info) {
        console.log(info);
    },
    eventReceive: function(info) {
        // Prevent the default positionning
        // info.event.remove();
    },
    resourceLabelDidMount: function(info) {
        return
        var questionMark = document.createElement('strong');
        questionMark.innerText = ' (?) ';
        info.el.querySelector('.fc-datagrid-cell-main')
        .appendChild(questionMark);
        var tooltip = new Tooltip(questionMark, {
        title: info.resource.title + '!!!',
        placement: 'top',
        trigger: 'hover',
        container: 'body'
        });
    }
});

calendar.setOption('height', '100%');
calendar.render();
// calendar.gotoDate( '2025-06-03' );
// calendar.scrollToTime( '2025-06-03' )


// calendar.today();

// Populate the calendar with extracted data
function populateCalendar() {
    showLoading();

    setTimeout(() => {
        calendar.removeAllEvents();
        
        const targetName = document.getElementById('nameDropdown').value;
        const personnePlanning = db.find(e => e.nomBis === targetName);
        if (!personnePlanning) {
            document.getElementById('generateButton').disabled = true;
            hideLoading();
            return;
        }
        document.getElementById('generateButton').disabled = false;

        personnePlanning.planification.forEach(plan => {
            if (plan.horaires.length > 0) {
                let formattedDate = plan.date.toISOString().split('T')[0];
                toggleDateEvent(formattedDate, true);

                plan.horaires.forEach(horaire => {
                    let [startHour, startMin] = horaire.split('-')[0].split('h').map(Number);
                    let [endHour, endMin] = horaire.split('-')[1].split('h').map(Number);
                    let eventStart = new Date(plan.date);
                    eventStart.setHours(startHour, startMin);
                    let eventEnd = new Date(plan.date);
                    eventEnd.setHours(endHour, endMin);
                    let eventName = getEventName(plan.nom, plan.raw, horaire);

                    calendar.addEvent({
                        title: eventName,
                        start: eventStart,
                        end: eventEnd,
                        allDay: false,
                        description: plan.raw,
                    });
                });
            }
        });

        calendar.setOption('height', '100%');
        calendar.render();
        calendar.today();

        hideLoading();
    }, 50); // Small delay ensures the UI updates
}




// Interactions
// ----------------------------------

// When we click on a DATE
function dateClicked(info) {
    // console.log(info);
    console.log('dateClicked', info.dateStr);
    let formattedDate = info.dateStr.split('T')[0]; // 'YYYY-MM-DD'
    toggleDateEvent(formattedDate, true);
}
// When we click on an EVENT
// Quand on clique sur un ÉVÉNEMENT
function eventClicked(info) {
    if (event.shiftKey) {
        // Suppression si la touche Maj est enfoncée
        if (confirm(`🗑 Supprimer l'événement "${info.event.title}" ?`)) {
            info.event.remove();
        }
    } else {
        let event = info.event;
        let startTime = event.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        let endTime = event.end ? event.end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "Heure inconnue";
        // Sinon, demander un nouveau nom
        let newName = prompt(
            `Modifier le nom de l'événement:\n\nNom actuel : ${event.title}\nHeure : ${startTime} - ${endTime}\nDescription : ${event.extendedProps.description || "Aucune description"}\n\n(⚠️ Maintenez Maj enfoncé et cliquez pour supprimer)`,
            event.title
        );
        if (newName !== null && newName.trim() !== "") {
            event.setProp("title", newName); // Met à jour le titre
        }
    }
}

// When we drop an event
function eventDroped(info) {
    console.log('eventDroped', info.dateStr);
    // console.log(info);
    // console.log(info.draggedEl);

    // Extract the data events
    let eventData = JSON.parse(info.draggedEl.getAttribute('data-info'));
    if(!Array.isArray(eventData)) eventData = [eventData];
    
    // Get the current date it was dropped on
    let formattedDate = info.dateStr.split('T')[0]; // 'YYYY-MM-DD'

    eventData.forEach(slot => {
        // Pour les events journaliers
        if(!!slot.allDay) {
            console.log('FULL DAY EVENT', formattedDate);
            calendar.addEvent({
                title: slot.title,
                start: formattedDate,
                end: formattedDate,
                allDay: true
            });
            return
        }

        let [startHour, startMin] = slot.startTime.split(':').map(Number);
        let [endHour, endMin] = slot.endTime.split(':').map(Number);

        let startDate = new Date(formattedDate);
        let endDate = new Date(formattedDate);

        startDate.setHours(startHour, startMin);
        endDate.setHours(endHour, endMin);

        calendar.addEvent({
            title: slot.title,
            start: startDate,
            end: endDate,
            allDay: false
        });
    });

    // On change la date
    toggleDateEvent(formattedDate, false);
}







// ==========
//   BUNDLE
// ==========

function cleanString(str) {
    return str.split(' ').filter(Boolean).join(' ');
}

function formatLocalDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function showLoading() {
    // console.log('Loading START');
    calendarEl.style.opacity = 0.5;
}

function hideLoading() {
    // console.log('Loading END');
    calendarEl.style.opacity = 1;
}