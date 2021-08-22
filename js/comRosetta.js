/*

    PIERRE DE ROSETTE DES COMMUNICATIONS DE LA PROTOBOARD

    Ici on définit la structure des communications entre les deux copains.
    Pour l'instant la limite testée est une string de 200 charactères.

    Le traitement des informations est le besoin de réponse seront entièrement traités
    à l'intérieur de l'engine du jeu. À terme ce sera des fonctions d'une librairie custom.
    

    --- --------- --- 
    --- RECEPTION --- 
    --- --------- --- 

      T3-154
      - T = Tile
      - Numéro de la tuile
      - Valeur de la lecture


    --- ----- --- 
    --- ENVOI --- 
    --- ----- --- 

      L-3:4:5-1-FF00FF-300

      - Operation type > L = LED
      - Numéro de la tuile concernée (separator ":")
      - Quelle LEDs
        16 - 0000    3 - 2
        15 - 0001    |   |
        14 - 0010    4   1
        13 - 0011
        12 - 0100
        11 - 0101
        10 - 0110
        9  - 0111
        8  - 1000
        7  - 1001
        6  - 1010
        5  - 1011
        4  - 1100
        3  - 1101
        2  - 1110
        1  - 1111
      - Couleur HEX à aller
      - Milliseconds pour fade
      
    

*/

