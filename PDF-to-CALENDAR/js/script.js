
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




// =============
//   VARIABLES
// =============

const equipeNom = [
    'CAMAIL',
    'DENIEL',
    'FRANCART',
    'HYPPOLITE',
    'JAQUILLARD',
    'MOPIN',
    'RENFER',
    'SORTAIS',
    'STRAGGIOTTI',
    'BARRACO',
    'BEAUGÉ',
    'BENVEGNIN',
    'GOMEZ',
    'NICOLET',
    'NIKOULIN',
    'OCHSNER',
    'PASCHE',
    'PERNIN',
    'RIZZARDI',
    'SLETTENHAAR',
    'BISCHOFF',
    'COSTA',
    'TRANCHET',
    'BERCHTOLD',
    'CECCON',
    'CHARRIER',
    'CORBEILLE',
    'DUFOUR',
    'ESPINOSA',
    'FESSLER',
    'GARCIA',
    'WILMOT',
    'CROSTA-BLANCO',
    'HUG'
]

const equipeNomBis = [
    'CAMAIL Marie-Anne',
    'DENIEL Tanguy',
    'FRANCART Theo',
    'HYPPOLITE Maurane',
    'JAQUILLARD Pierry',
    'MOPIN Lyvan',
    'RENFER Valerian',
    'SORTAIS Laure-Anne',
    'STRAGGIOTTI Emilien',
    'BARRACO Nicolas',
    'BEAUGÉ Laurent',
    'BENVEGNIN Emilie',
    'GOMEZ Jose',
    'NICOLET Olivier',
    'NIKOULIN Philip',
    'OCHSNER Estelle',
    'PASCHE Benoit',
    'PERNIN François-Xavier',
    'RIZZARDI Anne',
    'SLETTENHAAR Jan',
    'BISCHOFF Clementine',
    'COSTA Thiago',
    'TRANCHET Florian',
    'BERCHTOLD Diana',
    'CECCON Nicolas',
    'CHARRIER Richard',
    'CORBEILLE Coline',
    'DUFOUR Michel',
    'ESPINOSA Sebastian',
    'FESSLER Thomas',
    'GARCIA Andrea',
    // 'HUG Sylvie',
    'WILMOT Hector',
    'CROSTA-BLANCO Emiliano'
]

let equipePlanning = equipeNom.map((nom, index) => {
    
    let nomBis;
    // Find the corresponding nomBis value from equipeNomBis
    for (let fullName of equipeNomBis) {
        if (fullName.includes(nom)) { nomBis = fullName; break; }
    }

    return {
        nom: nom,
        nomBis: nomBis,
        planification: []
    };
});
// Sort equipePlanning in alphabetical order based on the nom property
equipePlanning.sort((a, b) => a.nom.localeCompare(b.nom));

// console.log(equipePlanning);

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




// ================
//   EXTRACT DATA
// ================

// On extrait les données de la plannification depuis les données des PDF
function extractPlannification(textContent, fileName) {
    return new Promise((resolve, reject) => {

        // Log
        // console.log(textContent);


        // ========= GET BOUNDARIES =========

        let Yboundaries = [70]; // Initial boundary (en bas)
        let Xboundaries = [30, 110, 210, 300, 395, 490, 590, 690, 800];

        // Extrait les Yboundaries
        for(let item of textContent.items) {
            for (let names of equipeNom) {
                if (item.str.toUpperCase().includes(names) && item.transform[4] < Xboundaries[1]) {
                    Yboundaries.push(parseInt(item.transform[5])+20);
                }
            }
        }
        Yboundaries = Yboundaries.sort((a, b) => b - a);
            // Tri dans l'ordre descendant
        // console.log(Yboundaries)


        // ========= EXTRACT RAW TEXT DATA =========

        // Table qui va prendre les informations text de manière 'raw'
        let table_raw_bis = Array.from({ length: Yboundaries.length-1 }, () => Array(8).fill(""));

        for(let item of textContent.items) {
            // Get x and y positions from the transform array
            const x = item.transform[4];
            const y = item.transform[5];

            // Get the actual row
            const index_temp = Yboundaries.findIndex((coord, i) => 
                y <= coord && (i === Yboundaries.length - 1 || y > Yboundaries[i + 1])
            );
            const currentRow = Yboundaries.length - 1 - index_temp;

            if (y > Yboundaries[Yboundaries.length-1] && y < Yboundaries[0]) {
                
                for (let i = 0; i < Xboundaries.length - 1; i++) {
                    if (x >= Xboundaries[i] && x < Xboundaries[i+1]) {
                        table_raw_bis[currentRow-1][i] += item.str + ' ';
                        break;  // Exit the loop once a match is found
                    }
                }
            }
            
        }

        // Log
        // console.log(table_raw_bis);


        // ========= PROCESS DATA =========

        // Inialise l'array qui va contenir toutes les planifications de tout le monde
        var equipe = [];

        // On va pour chaque array dans le tableau (PERSONNE)
        for(let i = 0; i < table_raw_bis.length; i++) {

            let tempTable = table_raw_bis[i];

            // --- UPDATE NOM DE LA PERSONNE ---
            let cleanedName = cleanString(tempTable[0]).toUpperCase();
            let matchingName = equipeNom.find(name => cleanedName.includes(name));

            // On prépare l'objet
            equipe[i] = { 
                nom: matchingName || 'NOT FOUND',
                planification : Array(7).fill(null).map(() => ({horraires: [], nom:'', raw:'', date: new Date()}))
            }


            // --- UPDATE DATE ---

            let initialDate = fileName.match(/\d{1,2}\.\d{1,2}\.\d{2}/g)[0];
            let [tempDay, tempMonth, tempYear] = initialDate.split('.').map(Number);
            tempYear = 2000 + tempYear;
            let currentDate = new Date(tempYear, tempMonth - 1, tempDay); // -1 on month because months are 0-indexed in JavaScript
                // On extrait la première date et on initialise un objet DATE

            // Pour tous les jours on attribu la date et on fait +1
            for (let j=0; j<7; j++) {
                equipe[i].planification[j].date = new Date(currentDate);;
                currentDate.setDate(currentDate.getDate()+1);
            }


            // On va dans toutes les lignes (JOURS)
            for (let j = 1; j < tempTable.length; j++) {

                let rawData = tempTable[j];
                // If empty
                if (!rawData.trim()) continue;
            
                let tempObject = equipe[i].planification[j-1];
                    // On chope l'objet actuel

                // --- UPDATE HORRAIRES --
                let tempHorrairesArray = rawData.match(/\d{2}h\d{2}-\d{2}h\d{2}/g) || [];
                    // Les horraires
                for (let k = 0; k < tempHorrairesArray.length; k++) {
                    // If current horaire is less than the last, assign to the next day
                    let lastHour = tempObject.horraires.length > 0 ? tempObject.horraires[tempObject.horraires.length-1].split('-')[1].split('h')[0]*1 : -1;
                    let currentHour = tempHorrairesArray[k].split('h')[0]*1;
                    if (currentHour >= lastHour) {
                        tempObject.horraires.push(tempHorrairesArray[k])
                    } else {
                        equipe[i].planification[j].horraires.push(tempHorrairesArray[k])
                    }
                }

                // --- UPDATE NOM DE LA TACHE ---
                tempNom = '';
                for (let word of potentialNames) {
                    if ( rawData.split('+')[0].toUpperCase().includes(word) ) {
                        tempNom = word;
                        break
                    }
                }
                tempObject.nom = tempNom;


                // --- UPDATE RAW DATA ---
                tempObject.raw = rawData;

                // -- SAVE DATA IN ARRAY --
                equipe[i].planification[j-1] = tempObject;
            }                

        }


        // ========= THEN =========

        // Log
        // console.log(equipe);

        // On envoi à makePlannification et on attends que ça résolve
        makePlannification(equipe).then(() => {
            // console.log('OK');
            resolve();
        })

    });
}

// Quand la donnée est extraite, à chaque feuille, on ajoute à la variable globale
function makePlannification(newDataToAdd) {

    // LOG
    console.log(newDataToAdd);

    for (const data of newDataToAdd) {

        // On retrouve la personne que l'on veut
        const personnePlanning = equipePlanning.find(e => e.nom === data.nom);
        if (!personnePlanning) {
            console.error(`No equipe found for ${data.nom}`);
            continue;
        }

        for (const newPlan of data.planification) {
            if (newPlan.horraires.length >= 1) {
                // Check if a planning with the same date already exists for this equipe
                const existingPlan = personnePlanning.planification.find(p => p.date.getTime() === newPlan.date.getTime());

                if (!existingPlan) {
                    // Append new planning to personnePlanning and ensure it's in chronological order
                    personnePlanning.planification.push(newPlan);
                    personnePlanning.planification.sort((a, b) => a.date.getTime() - b.date.getTime());
                }
            }
        }
    }

    return Promise.resolve(); 
}




// =================
//   MAKE CALENDAR
// =================

// DOM - rempli le dropdown
const dropdown = document.getElementById("nameDropdown");

// DOM - Add default option
const defaultOption = document.createElement("option");
defaultOption.value = '';
defaultOption.textContent = '---';
dropdown.appendChild(defaultOption);

// DOM - All options
equipeNomBis.sort().forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    dropdown.appendChild(option);
});

// Interaction quand on change la personne
document.getElementById('nameDropdown').addEventListener('change', function() {

    // On trouve qui on est
    const targetName = this.value;

    // On trouve sa planification
    const personnePlanning = equipePlanning.find(e => e.nomBis === targetName);
    if (!personnePlanning) {
        console.error(`No equipe found for ${targetName}`);
        return;
    }

    console.log(personnePlanning);
    if( personnePlanning.planification.length == 0 ) {
        console.log('Empty plannification');
        document.getElementById('calendar-planningTable').style.display = 'none';
        document.getElementById('calendar-error').style.display = 'inline-block';
        document.getElementById('generateButton').disabled = true;
        return
    }

    document.getElementById('calendar-planningTable').style.display = 'inline-block';
    document.getElementById('calendar-error').style.display = 'none';
    document.getElementById('generateButton').disabled = false;

    const tableBody = document.querySelector('#planningTable tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    // On peuple la table html
    personnePlanning.planification.forEach(plan => {
        plan.horraires.forEach(horraire => {

            const row = document.createElement('tr');

            // --- Checkbox column ---
            const checkboxTd = document.createElement('td');
            const label = document.createElement('label');
            label.className = 'switch';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            const span = document.createElement('span');
            span.className = 'slider round';
            label.appendChild(checkbox);
            label.appendChild(span);
            checkboxTd.appendChild(label);
            row.appendChild(checkboxTd);

            // --- Date column ---
            const dateTd = document.createElement('td');
            const dateInput = document.createElement('input');
            dateInput.type = 'text';
            const weekdays = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
            const dayOfWeek = weekdays[plan.date.getDay()];
            dateInput.value = `${dayOfWeek} ${plan.date.getDate()}.${plan.date.getMonth() + 1}.${plan.date.getFullYear().toString().slice(-2)}`;
            dateTd.appendChild(dateInput);
            row.appendChild(dateTd);

            // --- Hour column ---
            const hourTd = document.createElement('td');
            const hourInput = document.createElement('input');
            hourInput.type = 'text';
            hourInput.value = horraire;
            hourTd.appendChild(hourInput);
            row.appendChild(hourTd);

            // --- Name column ---
            const nameTd = document.createElement('td');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = 'RTS' + (plan.nom == '' ? '': (' ' + plan.nom)) ;
            // Exceptions
            let tempRow = plan.raw.toLowerCase();
            if ( tempRow.includes('elections fédérales') ) { nameInput.value = 'RTS ELEF' }
            if ( tempRow.includes('a bon entendeur') ) { nameInput.value = 'RTS ABE' }
            if ( tempRow.includes('a bon entendeur') && tempRow.includes('grop')) { nameInput.value = 'RTS GROP ABE' }
            if ( tempRow.includes('mise au point') && !tempRow.includes('chefat')) { nameInput.value = 'RTS MAP' }
            if ( tempRow.includes('info 35') ) { nameInput.value = 'RTS INFO35' }
            if ( tempRow.includes('digital sport') ) { nameInput.value = 'RTS DIGI SPORT' }
            if ( tempRow.includes('refonte actu') ) { nameInput.value = 'RTS ACTU23' }
            if ( tempRow.includes('autopromotion') ) { nameInput.value = 'RTS AUTOPROMO' }

            if ( horraire == '10h15-13h15' ) { nameInput.value = 'RTS GROP2' }
            if ( horraire == '14h30-20h15' ) { nameInput.value = 'RTS GROP2' }
            nameTd.appendChild(nameInput);
            row.appendChild(nameTd);

            // --- Raw info column ---
            const rawTd = document.createElement('td');
            const rawInput = document.createElement('input');
            rawInput.type = 'text';
            rawInput.style.width = "400px";  // or whatever width you prefer
            rawToParse = plan.raw
            rawToParse = rawToParse.replace(/0130|0135|0860|4\)/g, "");
                // Remove '0130' and '0135'
            rawToParse = rawToParse.replace(/\d{2}h\d{2}-\d{2}h\d{2}/g, "");
                // Remove strings matching the hour pattern
            rawToParse = rawToParse.replace(/\d-\d{5}-\d{4}/g, "");
            rawToParse = rawToParse.replace(/-\d{5}|-\d{4}/g, "");
                // Remove strings matching the pattern X-XXXXX-XXXX
            rawInput.value = cleanString(rawToParse);
            rawTd.appendChild(rawInput);
            row.appendChild(rawTd);

            tableBody.appendChild(row);
        });
    });
});


// DOM - Interraction du bouton
document.getElementById("generateButton").addEventListener("click", generateICSEvents);

// À partir de la selection on sort le .ICS
function generateICSEvents() {
    const ics = window.ics();

    document.querySelectorAll('#planningTable tbody tr').forEach(row => {

        const isChecked = row.querySelector('input[type="checkbox"]').checked;

        if (isChecked) {
            const dateValue = row.children[1].querySelector('input').value.split(' ')[1].split('.');
            const hourValue = row.children[2].querySelector('input').value;
            const nameValue = row.children[3].querySelector('input').value;
            const rawValue = row.children[4].querySelector('input').value;

            const [startHour, startMin] = hourValue.split('-')[0].split('h');
            const [endHour, endMin] = hourValue.split('-')[1].split('h');

            const startDate = new Date(parseInt(dateValue[2]) + 2000, parseInt(dateValue[1]) - 1, parseInt(dateValue[0]));
            startDate.setHours(Number(startHour), Number(startMin));

            const endDate = new Date(parseInt(dateValue[2]) + 2000, parseInt(dateValue[1]) - 1, parseInt(dateValue[0]));
            endDate.setHours(Number(endHour), Number(endMin));

            ics.addEvent(
                nameValue,
                rawValue,
                '',
                startDate,
                endDate
            );
        }
    });

    const targetName = document.getElementById('nameDropdown').value;
    ics.download(`Calendar_for_${targetName}`);
    
}








// ===========
//   ADD- ON
// ===========

function cleanString(str) {
    return str.split(' ').filter(Boolean).join(' ');
}

