

/*

    SCRIPT DE CONNECTION BLE

    Ce script est la base de la connection avec la board.
    La board et le script du game se connectent via le protocole BLE.

    Les avantages de la connection BLE sont : une connection stable
                                              une connection non-constante
                                              un passage d'informations bi-directionnelles

*/



// --- ---------------- ---
// --- STRUCTURE DU BLE ---
// --- ---------------- ---
    /* 

    - STRUCTURE DES INFORMATION -

      CENTRAL ───Read/Write/GetNotify───> PERIPHERAL
    (Computer)      │                     (Arduino)
                    │
                    ├─> READ : ask the peripheral to send back the current value of the characteristic
                    ├─> WRITE : modify the value of the characteristic
                    └─> INDICATE / NOTIFY : ask to continuously send updated values of the characteristic


    - STRUCTURE DES SERVICES - 

        BLE Peripheral
         └─> SERVICE
                └─> CHARACTERISTICS


            SERVICE
            Can be defined or use standard.
                └─> DEFINED : 128-bit UUID
                └─> STANDARD : 16-bit UUID

                    CHARACTERISTICS
                        └─> UP TO 512-bit
                        └─> STANDARD : 16-bit UUID
   
    */


// --- ----------------- ---
// --- VARIABLES LOCALES ---
// --- ----------------- ---

    // VARIABLES  GENERALES

        var bluetoothDevice = null ;
        var characteristic1, characteristic2, characteristic3; // Déclare les variables pour un acces ulterieur

        const decoder = new TextDecoder('utf-8'); // Decodeur pour pouvoir lire les strings


// --- ----------------------- ---
// --- FONCTION DE CONNECTIONS ---
// --- ----------------------- ---

    // connectBLE() - CONNECTION À LA BOARD 

        const connectBLE = async () => {
        bluetoothDevice = null;
        bluetoothDevice = await navigator.bluetooth
                	    .requestDevice({
                	    		acceptAllDevices: false,
                	    		filters: [
                				    {name: 'Transition Today',} // Spécifie le nom pour filter les appareils
                				],
                	    		optionalServices: ['00001234-0000-1000-8000-00805f9b34fb'] // Annonce le nom du service visé
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


    // disconnectBLE() - DECONNECTION DE LA BOARD 

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

        // ALERTE DE DECONNEXION

            function ifDisconnected(event) {
              // Object event.target is Bluetooth Device getting disconnected.
              alert('Bluetooth Device is disconnected');
              setBLEstatut("Disconnected");
            }


    // reconnectBLE() - RECONNECT À LA BOARD PERDUE

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









