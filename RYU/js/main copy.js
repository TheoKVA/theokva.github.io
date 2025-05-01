// =============
//   VARIABLES
// =============




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
let calendar = new FullCalendar.Calendar(calendarEl, {
    // timeZone: 'UTC',
    initialView: 'dayGridYear',
    headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridYear,timeGridWeek'
    },
    views: {
        dayGridYear : {
        },
        timeGridWeek: {
            scrollTime: '09:00:00',
            eventMinHeight: 10,
        },
    },
    selectable: true,
    editable: true,
    droppable: true, // For external events
    events: [], // Will be populated dynamically
    firstDay: 1, // Monday
    locale: 'fr', // the initial locale. if not specified, uses the first one
    dateClick: function(info) {
        dateClicked(info);
    },
    eventClick: function(info) {
        eventClicked(info);
    },
    drop: function(info) {
        eventDroped(info);
    },
    eventReceive: function(info) {
        // Prevent the default positionning
        info.event.remove();
    }
});

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


// Function to assign names based on raw content
function getEventName(name, rawContent, horaire) {
    rawContent = rawContent.toLowerCase();

    if (rawContent.includes('elections fédérales')) return 'ELEF';
    if (rawContent.includes('a bon entendeur')) return rawContent.includes('grop') ? 'GROP ABE' : 'ABE';
    if (rawContent.includes('mise au point') && !rawContent.includes('chefat')) return 'MAP';
    if (rawContent.includes('info 35')) return 'INFO35';
    if (rawContent.includes('digital sport')) return 'DIGI SPORT';
    if (rawContent.includes('refonte actu')) return 'ACTU23';
    if (rawContent.includes('autopromotion')) return 'AUTOPROMO';
    if (horaire === '10h15-13h15' || horaire === '14h30-20h15') return 'GROP ACTU';
    if (rawContent.includes('doublure')) return 'RTS (doublure)';
    if (name == '') return 'RTS';

    return name;
}

// Function to toggle DATES
function toggleDateEvent(dateStr, deactivate) {
    let events = calendar.getEvents(); // Get all events in the calendar
    let backgroundEvent = events.find(event => event.display === 'background' && event.startStr === dateStr);

    if (backgroundEvent) {
        if(deactivate) backgroundEvent.remove(); // Remove if already exists
    } else {
        calendar.addEvent({
            start: dateStr,
            end: dateStr,
            // overlap: false,
            display: 'background',
            color: 'rgb(159, 221, 180)' // Blue transparent background
        });
    }
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