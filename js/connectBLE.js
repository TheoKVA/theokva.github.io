

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
        var characteristicTX, characteristicRX; // Déclare les variables pour un acces ulterieur

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
                				    {name: 'PROTOBOARD V1',} // Spécifie le nom pour filter les appareils
                				],
                	    		optionalServices: ['0512249e-0286-11ec-9a03-0242ac130003'] // Annonce le nom du service visé
                	    	})
                        .catch(error => { console.error(error); });
        console.log("Bluetooth Device connected : " + bluetoothDevice.name); // LOG de Connexion
        setBLEstatut("Connected");

        bluetoothDevice.addEventListener('gattserverdisconnected', ifDisconnected); // en cas de déconnexion
        const server = await bluetoothDevice.gatt.connect();
        console.log(server);

        const service = await server.getPrimaryService('0512249e-0286-11ec-9a03-0242ac130003');
        console.log(service);


        // 1ere CHARACTERISTIQUE TX = ON RECOIE - READ / NOTIFY
        characteristicTX = await service.getCharacteristic('051227fa-0286-11ec-9a03-0242ac130003');
        characteristicTX.startNotifications(); // Notifications
        characteristicTX.addEventListener('characteristicvaluechanged', CharacteristicTXchanged);

        const readingTX = await characteristicTX.readValue();
        console.log("characteristicTX value = " + decoder.decode(readingTX));
        document.getElementById('BLEinfoTX').innerHTML = decoder.decode(readingTX);

        // 2eme CHARACTERISTIQUE RX = ON ENVOI - WRITE 
        characteristicRX = await service.getCharacteristic('0512270a-0286-11ec-9a03-0242ac130003');

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

    const CharacteristicTXchanged = (event) => {
    	console.log("New value was set = " + event.target.value.getUint8(0));
    	document.getElementById('BLEinfoTX').innerHTML = event.target.value.getUint8(0); // Change le HTML
    };


// FONCTIONS POUR ECRIRE CHARACTERISTIQUE2 DEPUIS L'HTML

    function setBLEchar2( str ) {
      console.log("HEY " + str);
      console.log("str.length " + str.length);
      if (characteristicRX == undefined) return; // console pas une erreur 
      var buffer = new Uint8Array(str.length);
      for (var i=0, strLen=str.length; i < strLen; i++) {
        buffer[i] = str.charCodeAt(i);
      }
      console.log("New value was set to = " + buffer);
    	characteristicRX.writeValue(buffer);
    };









