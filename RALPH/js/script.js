

// =============
//   VARIABLES
// =============

// Liste de l'équipe
const teamNames = [
    'CAMAIL Marie-Anne',
    'FRANCART Theo',
    'HYPPOLITE Maurane',
    'JAQUILLARD Pierry',
    'MOPIN Lyvan',
    'RENFER Valerian',
    'STRAGGIOTTI Emilien',
    'BARRACO Nicolas',
    'BEAUGÉ Laurent',
    'BENVEGNIN Emilie',
    'NICOLET Olivier',
    'NIKOULIN Philip',
    'OCHSNER Estelle',
    'PASCHE Benoit',
    'RIZZARDI Anne',
    'SLETTENHAAR Jan',
    'BISCHOFF Clementine',
    'COSTA Thiago',
    'TRANCHET Florian',
    'BERCHTOLD Diana',
    'CECCON Nicolas',
    'CHARRIER Richard',
    'CORBEILLE Coline',
    'ESPINOSA Sebastian',
    'GARCIA Andrea',
    'SPAGNOLO Terence',
    'WILMOT Hector',
    'CROSTA-BLANCO Emiliano',
    'FALLOT Jonathan'
]

// Génère la DB en déduisant automatiquement `nom` depuis `nomBis`
let db = teamNames.map(fullName => ({
    nom: fullName.split(' ')[0], // Prend uniquement le premier mot (nom de famille)
    nomBis: fullName, // Nom complet
    planification: []
})).sort((a, b) => a.nom.localeCompare(b.nom)); // Tri alphabétique


const potentialNames = [
    'GROP1', 
    'GROP2', 
    'CHEFAT', 
    'MAP', 
    'INFRA', 
    'GÉOP', 
    'GEOP', 
    'INFO 35', 
    'INFO35', 
    'SPDI', 
    'SPDE',
    'LC',
    'SPORT', 
    'CA JOUE',
    'GROP', 
    'GRAA', 
    'ACTU', 
    'DIGITAL',
    'AGEFI',
    'FORMATION',
    'TEMPLATISATION',
    'BRAND',
    'VIVANTS',
    'PAJU',
    '36.9',
    'BASIK',
    'AUTOPROMO',
    'TP',
    'ATELIER', 
    'ENTRET. RH'
];


// ============
//   DROPDOWN
// ============

// DOM - rempli le dropdown
const dropdown = document.getElementById("nameDropdown");

// DOM - Add default option
const defaultOption = document.createElement("option");
defaultOption.value = '';
defaultOption.textContent = '---';
dropdown.appendChild(defaultOption);

// DOM - All options
teamNames.sort().forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    dropdown.appendChild(option);
});

// Interaction quand on change la personne
document.getElementById('nameDropdown').addEventListener('change', populateCalendar);



// ====================
//   HANDLE PDF FILES
// ====================

const fileInput = document.getElementById('upload');
fileInput.addEventListener('change', handleFileUpload);

// Gère l'action
async function handleFileUpload(event) {

    const files = event.target.files;
    const promises = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
            try {
                const { data, name } = await readFileAsArrayBuffer(file);
                loadPDF(data, name);
            } catch (error) {
                console.error('Error reading file:', file.name, error);
            }
        }
    }

}

// Lit le buffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            resolve({data: new Uint8Array(evt.target.result), name: file.name});
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Lance la lecture du PDF
function loadPDF(pdfData, fileName) {

    const loadingTask = pdfjsLib.getDocument({data: pdfData});
    
    loadingTask.promise.then(pdf => {
        console.log('PDF loaded');
        getReadyForCalendar();
    
        const pagePromises = Array.from({ length: pdf.numPages }, (_, i) => i + 1)
            .map(pageNum => {
                return function() {
                    return pdf.getPage(pageNum).then(page => {
                        return page.getTextContent();
                    }).then(textContent => {
                        console.log('PAGE '+ pageNum + '(sur ' + pdf.numPages + ') de ' + fileName);
                        return extractPlannification(textContent, fileName);
                    });
                };
            });
    
        pagePromises.reduce((acc, currFn) => {
            return acc.then(currFn);
        }, Promise.resolve());
    });

}




// ================
//   EXTRACT DATA
// ================

function extractPlannification(textContent, fileName) {
    return new Promise((resolve, reject) => {

        let Yboundaries = [70]; 
        let Xboundaries = [30, 110, 210, 300, 395, 490, 590, 690, 800];

        // Extrait les Yboundaries
        for (let item of textContent.items) {
            for (let person of db) {
                if (item.str.toUpperCase().includes(person.nom) && item.transform[4] < Xboundaries[1]) {
                    Yboundaries.push(parseInt(item.transform[5]) + 20);
                }
            }
        }
        // Tri dans l'ordre descendant
        Yboundaries.sort((a, b) => b - a);

        // ========= EXTRACT RAW TEXT DATA =========

        // Crée une table temporaire pour stocker les données extraites
        let table_raw_bis = Array.from({ length: Yboundaries.length - 1 }, () => Array(8).fill(""));

        for (let item of textContent.items) {
            const x = item.transform[4];
            const y = item.transform[5];

            const index_temp = Yboundaries.findIndex((coord, i) => 
                y <= coord && (i === Yboundaries.length - 1 || y > Yboundaries[i + 1])
            );
            const currentRow = Yboundaries.length - 1 - index_temp;

            if (y > Yboundaries[Yboundaries.length - 1] && y < Yboundaries[0]) {
                for (let i = 0; i < Xboundaries.length - 1; i++) {
                    if (x >= Xboundaries[i] && x < Xboundaries[i + 1]) {
                        table_raw_bis[currentRow - 1][i] += item.str + ' ';
                        break;
                    }
                }
            }
        }

        // Log
        // console.log('table_raw_bis', table_raw_bis);


        // ========= PROCESS DATA =========

        // Extraction et mise à jour directe dans `db`
        // On va pour chaque array dans le tableau (PERSONNE)
        for (let row of table_raw_bis) {
            let cleanedName = cleanString(row[0]).toUpperCase();
            let person = db.find(p => cleanedName.includes(p.nom));

            if (!person) continue;

            // On part du premier jour. Dans le nom du fichier.
            let initialDate = fileName.match(/\d{1,2}\.\d{1,2}\.\d{2}/g)[0];
            let [day, month, year] = initialDate.split('.').map(Number);
            year += 2000;
            // let currentDate = new Date(year, month - 1, day);

            // Initialize planification for 7 days
            person.planification = Array(7).fill(null).map((_, index) => ({
                horaires: [],
                nom: '',
                raw: '',
                date: new Date(year, month - 1, day + index, 12) // Set time to 12:00:00 for time shifts
            }));

            // On va dans toutes les lignes (JOURS)
            for (let j = 1; j < row.length; j++) {
                let rawData = row[j].trim();
                if (!rawData) continue;

                let tempDay = person.planification[j - 1]; // Get the current day's event
                tempDay.raw = rawData; // Store raw data

                for (let word of potentialNames) {
                    if (rawData.split('+')[0].toUpperCase().includes(word)) {
                        tempDay.nom = word;
                        break;
                    }
                }

                // --- UPDATE horaireS ---
                let temphorairesArray = rawData.match(/\d{2}h\d{2}-\d{2}h\d{2}/g) || [];
                for (let k = 0; k < temphorairesArray.length; k++) {
                    let [startHour] = temphorairesArray[k].split('-')[0].split('h').map(Number);
                    let lastHour = tempDay.horaires.length > 0 
                        ? tempDay.horaires[tempDay.horaires.length - 1].split('-')[1].split('h')[0] * 1 
                        : -1;

                    if (startHour >= lastHour) {
                        tempDay.horaires.push(temphorairesArray[k]); // Assign to the same day
                    } else if (j < 7) {
                        person.planification[j].horaires.push(temphorairesArray[k]); // Assign to next day
                    }
                }

            }
        }

        console.log(db);
        resolve();
    });
}




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
        allDay: true,
        };
    }
});


// initialize the calendar
// -----------------------------------------------------------------
let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'multiMonthYear',
    multiMonthMaxColumns: 1, // force a single column
    // initialView: 'dayGridMonth',
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
    }
});

// Populate the calendar with extracted data
function populateCalendar() {

    // Clear the calendar
    calendar.removeAllEvents();
    
    // Get selected person
    const targetName = document.getElementById('nameDropdown').value;
    const personnePlanning = db.find(e => e.nomBis === targetName);
    if (!personnePlanning) {
        document.getElementById('generateButton').disabled = true;
        return;
    }
    document.getElementById('generateButton').disabled = false;

    // Extract events from their planification
    personnePlanning.planification.forEach(plan => {
        if (plan.horaires.length > 0) {

            // DATE
            let formattedDate = plan.date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
            toggleDateEvent(formattedDate, true);

            plan.horaires.forEach(horaire => {
                let [startHour, startMin] = horaire.split('-')[0].split('h').map(Number);
                let [endHour, endMin] = horaire.split('-')[1].split('h').map(Number);
                let eventStart = new Date(plan.date);
                eventStart.setHours(startHour, startMin);
                let eventEnd = new Date(plan.date);
                eventEnd.setHours(endHour, endMin);
                let eventName = getEventName(plan.nom, plan.raw, horaire);

                calendar.addEvent(
                    {
                        title: eventName,
                        start: eventStart,
                        end: eventEnd,
                        allDay: false,
                        description: plan.raw,
                    }
                );
            });
        }
    });

    // Update FullCalendar
    calendar.setOption('height', '100%');
    calendar.render();
    calendar.today();
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
    toggleDateEvent(info.dateStr, true);
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
    toggleDateEvent(info.dateStr, false);
}






// ==========
//   EXPORT
// ==========

// DOM - Interraction du bouton
document.getElementById("generateButton").addEventListener("click", generateICSEvents);

function generateICSEvents() {
    console.log('NEW EXPORT');

    const ics = window.ics();
    const events = calendar.getEvents();

    // Get all background (export filter) dates
    let exportDates = events
        .filter(event => event.display === 'background')
        .map(event => event.startStr); // Extract the date in 'YYYY-MM-DD' format

    console.log("Exporting events for dates:", exportDates);

    // Filter events that match the export dates
    events.forEach(event => {
        if (event.display === 'background') return; // Skip background events

        let eventDate = formatLocalDate(event.start); // Extract event date

        if (exportDates.includes(eventDate)) {
            console.log("Exporting event:", event.title, event.start, event.end);

            ics.addEvent(
                event.title,
                event.extendedProps?.description || '',
                '',
                event.start,
                event.end
            );
        }
    });

    // Download ICS file
    const targetName = document.getElementById('nameDropdown').value;
    console.log("Exporting ICS");
    ics.download(`Calendar_for_${targetName.replace(' ', '-')}`);
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