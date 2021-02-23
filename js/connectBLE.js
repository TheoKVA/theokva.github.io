

// CODE BLE

var bluetoothDevice = null ;
var characteristic1, characteristic2, characteristic3; // Déclare les variables pour un acces ulterieur

const decoder = new TextDecoder('utf-8'); // Decodeur pour pouvoir lire les strings


// CONNECTION À LA BOARD
const connectBLE = async () => {
bluetoothDevice = null;
bluetoothDevice = await navigator.bluetooth
	    .requestDevice({
	    		acceptAllDevices: false,
	    		filters: [
				    {name: 'Transition Today',}
				],
	    		optionalServices: ['00001234-0000-1000-8000-00805f9b34fb']
	    	})
        .catch(error => { console.error(error); });
console.log("Bluetooth Device connected : " + bluetoothDevice.name); // LOG de Connexion
setBLEstatut("Connected");

bluetoothDevice.addEventListener('gattserverdisconnected', ifDisconnected); // en cas de déconnexion
const server = await bluetoothDevice.gatt.connect();
console.log(server);

const service = await server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
console.log(service);


// 1ere CHARACTERISTIQUE = READ / NOTIFY - GROWING NUMBER
characteristic1 = await service.getCharacteristic('00001234-0001-1000-8000-00805f9b34fb');
characteristic1.startNotifications(); // Notifications
characteristic1.addEventListener('characteristicvaluechanged', Characteristic1Changed);

const reading = await characteristic1.readValue();
console.log("characteristic1 value = " + reading.getUint8(0));
document.getElementById('BLEinfo1').innerHTML = reading.getUint8(0);

// 2eme CHARACTERISTIQUE = WRITE - LED STATUS
characteristic2 = await service.getCharacteristic('00001234-0002-1000-8000-00805f9b34fb');

// 3eme CHARACTERISTIQUE = READ - STRING
characteristic3 = await service.getCharacteristic('00001234-0003-1000-8000-00805f9b34fb');

const reading3 = await characteristic3.readValue();
console.log("characteristic3 value = " + decoder.decode(reading3)); // Permet de lire la string
document.getElementById('BLEinfo3').innerHTML = decoder.decode(reading3);

};


// DECONNECTION / RECONNECTION

function ifDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  alert('Bluetooth Device is disconnected');
  setBLEstatut("Disconnected");
}

function disconnectBLE() {
  if (!bluetoothDevice) {
    return;
  }
  console.log('Disconnecting from Bluetooth Device.');
  if (bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
    setBLEstatut("Disconnected");
  } else {
    console.log('> Bluetooth Device is already disconnected.');
  }
}

function reconnectBLE() { // retrieve values
  if (!bluetoothDevice) {
    return;
  }
  if (bluetoothDevice.gatt.connected) {
    console.log('> Bluetooth Device is already connected');
    return;
  }
  bluetoothDevice.gatt.connect()
  .then(server => {
	console.log("Bluetooth Device connected : " + bluetoothDevice.name);
  setBLEstatut("Connected");
  })
  .catch(error => { console.error(error); });
}

// FONCTION POUR LOG LE STATUT
function setBLEstatut(statut) {
  document.getElementById('BLEstatut').innerHTML = statut;
}


// FONCTIONS POUR LIRE LES NOUVELLES CHARACTERISTIQUES
const Characteristic1Changed = (event) => {
	console.log("New value was set = " + event.target.value.getUint8(0));
	document.getElementById('BLEinfo1').innerHTML = event.target.value.getUint8(0); // Change le HTML
};


// FONCTIONS POUR ECRIRE CHARACTERISTIQUE2 DEPUIS L'HTML
function setBLEchar2(inputToPut) {
  if (characteristic2 == undefined) return; // console pas une erreur 
	const buffer = new Uint8Array(2);
	buffer[0] = inputToPut;
	characteristic2.writeValue(buffer);
};









