



const connectToDeviceAndSubscribeToUpdates = async () => {
const device = await navigator.bluetooth
	    .requestDevice({
	    		acceptAllDevices: true,
	    		optionalServices: ['00001234-0000-1000-8000-00805f9b34fb']
	    	})
	 //    .then(device => {
  //           	console.log(device);
  //           	device.gatt.connect();
  //           	return this.device
  //           })
		// .then(server => {
		// 	server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
		// })
		// .then(service => {
		// 	  chosenHeartRateService = service;
		// 	  return Promise.all([
		// 	    service.getCharacteristic('00001234-0001-1000-8000-00805f9b34fb')
		// 	      .then(logWorld),
		// 	  ])
		// })
        .catch(error => { console.error(error); });
console.log(device);

const server = await device.gatt.connect();
console.log(server);

const service = await server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
console.log(service);

const characteristic = await service.getCharacteristic('00001234-0001-1000-8000-00805f9b34fb');
console.log(characteristic);

characteristic.startNotifications();
characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

const reading = await characteristic.readValue();
console.log("value = " + reading.getUint8(0));

document.getElementById('informationsGet').innerHTML = reading.getUint8(0);

// const characteristic = await 
// 		service.getCharacteristic('19B10001-E8F2-537E-4F6C-D104768A1214');

// 	characteristic.startNotifications();
//    	characteristic.addEventListener('characteristicvaluechanged', 
//    			handleCharacteristicValueChanged);

// const reading = await 
// 		characteristic.readValue();

// console.log(reading.getUint8(0));


};

const handleCharacteristicValueChanged = (event) => {
	console.log("new value was set = " + event.target.value.getUint8(0));
	document.getElementById('informationsGet').innerHTML = event.target.value.getUint8(0);
};


