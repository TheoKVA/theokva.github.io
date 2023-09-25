
// INITIALISATION
// des variables des animations
gsap.to(":root", {
    "--cross-X": 50,
    "--cross-Y": 100,
    "--cross-X-plus": 0,
    "--cross-Y-plus": 0,
    duration: 1.2,
    ease: "power2.inOut"
});
 
// ===================
//   MOBILE FIRENDLY
// ===================
/*
    On scale en cas de plus petit qu'une certaine largeur
*/

window.addEventListener('resize', checkWidth);
function checkWidth() {
  const div = document.body;
  const minWidth = 550;
  const windowWidth = window.innerWidth;

  if (windowWidth < minWidth) {
    const scale = windowWidth / minWidth;
    div.style.transform = `scale(${scale})`;
    div.style.width = `${100/scale}%`;
    div.style.height = `calc(${100/scale}vh)`; 
  } else {
    div.style.transform = 'scale(1)';
    div.style.width = '100%';
    div.style.height = 'calc(100vh)'; 
  }
}
checkWidth();



// ===============
//   TOP SECTION
// ===============
/*
    On ouvre la section au drag
    On ferme au drop de fichiers,
    on ferme quand on clique
*/

const topSection = document.getElementById("top-section");
const uploadSection = document.getElementById("upload-section");
const calendarSection = document.getElementById("calendar-section");
let dragDepth = 0;

window.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

window.addEventListener("dragenter", function(e) {
    dragDepth++;

    if (dragDepth === 1) {
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            gsap.to(":root", {
                "--cross-X": 80,
                duration: 1.2,
                ease: "power2.inOut"
            });
        }
    }
    
});

window.addEventListener("dragleave", function(e) {
    setTimeout(() => {
        dragDepth--;
        if (dragDepth === 0) {

            gsap.to(":root", {
                "--cross-X": 50,
                duration: 1.2,
                ease: "power2.inOut"
            });
            
        }
    }, 0); 
});

window.addEventListener("drop", function(e) {
    e.preventDefault();
    e.stopPropagation();

    dragDepth = 0; // reset the counter
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;

        // Construct an event object and call the handler
        const evt = { target: fileInput };
        handleFileUpload(evt);
        // getReadyForCalendar(); // Pas ici, quand on a loadé
    }

});

// Simule le clic
uploadSection.addEventListener('click', function() {
    fileInput.click();
    if (bottomSectionIsOpen) bottomSectionClose.click();
    // getReadyForCalendar();
});

const uploadSectionTitle = document.getElementById("upload-section-title");
const calendarSectionTitle = document.getElementById("calendar-section-title");
const calendarSectionClose = document.getElementById("calendar-section-close-btn");
let calendarSectionIsOpen = false

function getReadyForCalendar() {

    // On coupe si déjà ouvert
    if(calendarSectionIsOpen) return

    // On fait disparaitre uploadSectionTitle
    gsap.fromTo(uploadSectionTitle,{
        opacity: "100%",
    },{
        opacity: "0%",
        duration: 0.3,
        onComplete: function() {
            uploadSectionTitle.style.visibility = "hidden";
        }
    });

    // On fait disparaitre calendarSectionTitle
    gsap.fromTo(calendarSectionTitle,{
        opacity: "100%",
    },{
        opacity: "0%",
        duration: 0.3,
        onComplete: function() {
            calendarSectionTitle.style.visibility = "hidden";
        }
    });

    // On fait disparaitre calendarSectionTitle
    gsap.to(uploadSection,{
        padding: 0,
        duration: 1.2,
        onComplete: function() {
            uploadSection.style.visibility = "hidden";
        }
    });

    // On prépare la section calendar
    gsap.to(":root", {
        "--cross-X": 0,
        "--radius-ref": '100px',
        duration: 1.2,
        ease: "power2.inOut"
    });

    calendarSectionIsOpen = true;
}
calendarSectionClose.addEventListener("click", function() {

    // On vide le tableau
    const tableBody = document.querySelector('#planningTable tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    uploadSectionTitle.style.visibility = "visible";
    calendarSectionTitle.style.visibility = "visible";
    uploadSection.style.visibility = "visible";

    // On fait apparaitre uploadSectionTitle
    gsap.to(uploadSectionTitle,{
        opacity: "100%",
        duration: 0.3
    });

    // On fait apparaitre calendarSectionTitle
    gsap.to(calendarSectionTitle,{
        opacity: "100%",
        duration: 0.3
    });

    // On prépare la section calendar
    gsap.to(":root", {
        "--cross-X": 50,
        "--radius-ref": '300px',
        duration: 1.2,
        ease: "power2.inOut"
    });

    calendarSectionIsOpen = false

});




// ==================
//   BOTTOM SECTION
// ==================
/*
    On veut que ça s'ouvre quand on clic
    On ferme quand on clic sur la croix
*/

const bottomSection = document.getElementById("bottom-section");
const infoButton = document.getElementById("info-button");
const bottomSectionClose = document.getElementById("bottom-section-close-btn");
let bottomSectionIsOpen = false

infoButton.addEventListener("click", function() {

    // Check if we can click
    if(bottomSectionIsOpen) return;
    bottomSectionIsOpen = true;

    // Active le scroll
    bottomSection.style.overflowY = "auto";

    const foldDirection = getComputedStyle(document.documentElement).getPropertyValue('--fold-direction').trim();
    gsap.to(":root", {
        "--cross-Y": foldDirection=='column'? 30 : 40,
        "--title-gap": foldDirection=='column'? 12 : 2,
        duration: 0.8,
        ease: "power2.easeOut"
    });

});

bottomSectionClose.addEventListener("click", function() {

    // Réinitialise le scroll
    bottomSection.style.overflowY = "hidden";
    bottomSection.scrollTop = 0;

    gsap.to(":root", {
        "--cross-Y": 100,
        "--title-gap": 12,
        duration: 0.8,
        ease: "power2.easeOut",
        onComplete: function() {
            bottomSectionIsOpen = false;
        }

    });

});




// =================
//   WIGGLE WIGGLE
// =================
/*
    Léger wiggle GAUCHE-DROITE quand on passe la souris dessus
*/

uploadSection.addEventListener("mouseenter", function() {
    gsap.to(":root", {
        "--cross-X-plus": 1,
        duration: 0.4,
        ease: "power1.easeOut"
    });
});
uploadSection.addEventListener("mouseleave", function() {
    gsap.to(":root", {
        "--cross-X-plus": 0,
        duration: 0.4,
        ease: "power1.easeOut"
    });
});

calendarSection.addEventListener("mouseenter", function() {
    if(calendarSectionIsOpen) return;
    gsap.to(":root", {
        "--cross-X-plus": -1,
        duration: 0.4,
        ease: "power1.easeOut"
    });
});
calendarSection.addEventListener("mouseleave", function() {
    if(calendarSectionIsOpen) return;
    gsap.to(":root", {
        "--cross-X-plus": 0,
        duration: 0.4,
        ease: "power1.easeOut"
    });
});
