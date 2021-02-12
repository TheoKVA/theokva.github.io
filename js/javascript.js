
// STRUCTURE DU CODE BLE

var characteristic, characteristic2, characteristic3; // Déclare les variables à l'extérieur pour y accéder

const connectToBLEDevice = async () => {
const device = await navigator.bluetooth
	    .requestDevice({
	    		acceptAllDevices: true,
	    		optionalServices: ['00001234-0000-1000-8000-00805f9b34fb']
	    	})
        .catch(error => { console.error(error); });
console.log(device);

const server = await device.gatt.connect();
console.log(server);

const service = await server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
console.log(service);


// 1ere CHARACTERISTIQUE = READ / NOTIFY - GROWING NUMBER
characteristic = await service.getCharacteristic('00001234-0001-1000-8000-00805f9b34fb');
console.log(characteristic);
characteristic.startNotifications();
characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
const reading = await characteristic.readValue();
console.log("value = " + reading.getUint8(0));
document.getElementById('informationsGet').innerHTML = reading.getUint8(0);

// 2eme CHARACTERISTIQUE = WRITE - LED STATUS
characteristic2 = await service.getCharacteristic('00001234-0002-1000-8000-00805f9b34fb');
console.log(characteristic2);


// 3eme CHARACTERISTIQUE = READ - STRING
characteristic3 = await service.getCharacteristic('00001234-0003-1000-8000-00805f9b34fb');
console.log(characteristic3);

const decoder = new TextDecoder('utf-8');
const reading3 = await characteristic3.readValue();
console.log("value = " + decoder.decode(reading3));

};


const handleCharacteristicValueChanged = (event) => {
	console.log("new value was set = " + event.target.value.getUint8(0));
	document.getElementById('informationsGet').innerHTML = event.target.value.getUint8(0);
};


function setCharacteristic(inputToPut) {
	const buffer = new Uint8Array(2);
	buffer[0] = inputToPut;
	characteristic2.writeValue(buffer);
};



