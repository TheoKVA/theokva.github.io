
// STRUCTURE DU CODE BLE

var characteristic, characteristic2; // Déclare les variables à l'extérieur pour y accéder

const connectToDeviceBLE = async () => {
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

characteristic = await service.getCharacteristic('00001234-0001-1000-8000-00805f9b34fb');
console.log(characteristic);

characteristic.startNotifications();
characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
const reading = await characteristic.readValue();
console.log("value = " + reading.getUint8(0));

document.getElementById('informationsGet').innerHTML = reading.getUint8(0);

characteristic2 = await service.getCharacteristic('00001234-0002-1000-8000-00805f9b34fb');
console.log(characteristic2);

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



