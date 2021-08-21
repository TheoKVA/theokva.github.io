
//   *   )                       )                *   )    (               
// ` )  /((      )         (  ( /((             ` )  /(    )\ )   ) (      
//  ( )(_))(  ( /(  (    ( )\ )\())\  (   (      ( )(_)|  (()/(( /( )\ )   
// (_(_()|()\ )(_)) )\ ) )((_|_))((_) )\  )\ )  (_(_()))\  ((_))(_)|()/(   
// |_   _|((_|(_)_ _(_/(((_|_) |_ (_)((_)_(_/(  |_   _((_) _| ((_)_ )(_))  
//   | | | '_/ _` | ' \)|_-< |  _|| / _ \ ' \))   | |/ _ Y _` / _` | || |_ 
//   |_| |_| \__,_|_||_|/__/_|\__||_\___/_||_|    |_|\___|__,_\__,_|\_, (_)
//                                                                  |__/   



#include <ArduinoBLE.h>

BLEService MyService("00001234-0000-1000-8000-00805f9b34fb");    

BLEByteCharacteristic Characteristic1("00001234-0001-1000-8000-00805f9b34fb", BLERead | BLENotify);
BLEIntCharacteristic Characteristic2("00001234-0002-1000-8000-00805f9b34fb", BLERead | BLEWrite);
BLEStringCharacteristic Characteristic3("00001234-0003-1000-8000-00805f9b34fb", BLERead | BLEWrite, 30);


int Btn1 = 5;
int Btn2 = 6;
bool IsDown1 = false;
bool IsDown2 = false;

int index1 = 3;
String testString = "ABCDE";

#define RED 22
#define GREEN 23
#define BLUE 24


void setup() {

    pinMode(Btn1, INPUT_PULLUP);
    pinMode(Btn2, INPUT_PULLUP);

    pinMode(RED, OUTPUT);
      digitalWrite(RED, HIGH);  // LED RGB -> LOW_ACTIVATED
    pinMode(BLUE, OUTPUT);
      digitalWrite(BLUE, HIGH);
    pinMode(GREEN, OUTPUT);
      digitalWrite(GREEN, HIGH);
    
    Serial.begin(9600); 
    // while (!Serial); // Coupe le code tant que le serial n'est pas là

    if (!BLE.begin()) { 
      Serial.println("starting BLE failed!");
      digitalWrite(RED, LOW);  // LOW_ACTIVATED RED IF FAIL
      while (1);
    }


    BLE.setLocalName("Transition Today");
    BLE.setDeviceName("Transition Today");

      BLE.setAdvertisedService( MyService );

        MyService.addCharacteristic( Characteristic1 );
          Characteristic1.writeValue( index1 );
          
        MyService.addCharacteristic( Characteristic2 );
          Characteristic2.setEventHandler( BLEWritten, functionHandler1 ); // POUR LA REACTION
          Characteristic2.writeValue( 1 );

        MyService.addCharacteristic( Characteristic3 );
          Characteristic3.writeValue( testString );

      BLE.addService( MyService );


    BLE.setEventHandler(BLEConnected, blePeripheralConnectHandler); // DEBUG
    BLE.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler); // DEBUG

    BLE.advertise();

    Serial.println("Set up is done. Waiting for connection...");
    
    digitalWrite(BLUE, LOW); // LOW_ACTIVATED - NOT CONNECTED
}



void loop() {
    BLE.poll();

// ------ BTN -----

    if (digitalRead(Btn1) == 0 && IsDown1 == true) {
      Serial.println(" Key 1 is down");
      IsDown1 = false;  
      delay(50);
      index1 ++;
      Characteristic1.writeValue(index1); // CHANGE LA VALEUR (ET NOTTIFIE)
      Serial.print(" New Value = ");
      Serial.println( Characteristic1.value() );
    }
    if (digitalRead(Btn1) == 1 && IsDown1 == false) {
      Serial.println(" Key 1 is up");
      IsDown1 = true;
      delay(50);
    }

    if (digitalRead(Btn2) == 0 && IsDown2 == true) {
      Serial.println(" Key 2 is down");
      IsDown2 = false;
        digitalWrite(RED, HIGH);  // LOW_ACTIVATED - TURN EVRTHG OFF
        digitalWrite(BLUE, HIGH);
        digitalWrite(GREEN, HIGH);
      delay(50);
    }
    if (digitalRead(Btn2) == 1 && IsDown2 == false) {
      Serial.println(" Key 2 is up");
      IsDown2 = true;
      delay(50);
    }

}



void blePeripheralConnectHandler(BLEDevice central) {
    // INDICATION SERIAL
      Serial.print("Connected event, central: ");
      Serial.println(central.address());
    // INDICATION LED
      digitalWrite(RED, HIGH);  // LOW_ACTIVATED - GREEN = CONNECTED
      digitalWrite(GREEN, LOW); 
      digitalWrite(BLUE, HIGH);  
}

void blePeripheralDisconnectHandler(BLEDevice central) {
    // INDICATION SERIAL
      Serial.print("Disconnected event, central: ");
      Serial.println(central.address());
    // INDICATION LED
      digitalWrite(RED, HIGH);  // LOW_ACTIVATED - BLUE = WAITING
      digitalWrite(GREEN, HIGH); 
      digitalWrite(BLUE, LOW); 
}

void functionHandler1(BLEDevice central, BLECharacteristic characteristic) {
    Serial.print("Characteristic2 event, written: ");
    Serial.println( Characteristic2.value() );

    if ( Characteristic2.value() == 0 ) {
      digitalWrite(RED, HIGH);  // LED RGB -> LOW_ACTIVATED
      digitalWrite(BLUE, HIGH);
      digitalWrite(GREEN, HIGH);
    }
    if ( Characteristic2.value() == 1 ) {
      digitalWrite(RED, LOW);  // LED RGB -> LOW_ACTIVATED
      digitalWrite(GREEN, HIGH); 
      digitalWrite(BLUE, HIGH); 
    }
    if ( Characteristic2.value() == 2 ) {
      digitalWrite(RED, HIGH);  // LED RGB -> LOW_ACTIVATED
      digitalWrite(GREEN, LOW); 
      digitalWrite(BLUE, HIGH);     
    }
    if ( Characteristic2.value() == 3 ) {
      digitalWrite(RED, HIGH);  // LED RGB -> LOW_ACTIVATED
      digitalWrite(GREEN, HIGH); 
      digitalWrite(BLUE, LOW);      
    }
}
