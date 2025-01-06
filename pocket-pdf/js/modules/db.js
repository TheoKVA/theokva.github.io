
// - - - - - - - - - - - - - - -

// Shared database array
export const db = []; 

// Variable for storing temp parameters
export let tempEntrie = {};

// Variable to store all the images
export const defaultEntrie = {
    'id': null,
    'pageIndex': -1,
    'changeOccured': null,
    'imageParameters': { 
        'format': {
            'name': null, // custom / A5 / A4 / A3 -- TO DO
            'widthMM': null,
            'heightMM': null,
        },
        'orientation': 'auto', // auto / vertical / horizontal -- TO DO
        'colorMode': 'auto', // auto / color / grayscale / blackAndWhite -- TO DO
        'filter': {
            'black': 15, // default values
            'middle': 1, // default values
            'white': 240, // default values
            'grayscale': false, // default values
        },
    },
    'imageOriginal': {
        'source': null,
        'width': -1,
        'height': -1,
    },
    'imageProcessed' : {},
    'imageScaled': {
        'source': null,
        'canvas': null,
        'scaleFactor': -1,
        'rotation': 0,
        'containerTop': -1,
        'containerLeft': -1,
        'top': -1,
        'left': -1,
        'width': -1,
        'height': -1,
    },
    'cornerPoints': {},
}

// Variable to store the project settings
export let projectSettings = {
    'format': {
        'name': 'A4',
        'widthMM': 210,
        'heightMM': 297,
        'dpi': 200,
    },
    'compression' : 0.8
}

// - - - - - - - - - - - - - - -


// Add element to DB
export function addToDb(item) {
    db.push(item);
}

// Remove an element from DB based on id value
export function removeFromDb(id) {
    const index = db.findIndex(item => item.id === id);
    if (index !== -1) {
        db.splice(index, 1); // Remove the item from db
        return true;
    }
    return false;
}

// Grab an element based on it's ID
export const dbElemById = (id) => {
    return db.find(item => item.id === id);
}

export function resetTempEntry() {

}