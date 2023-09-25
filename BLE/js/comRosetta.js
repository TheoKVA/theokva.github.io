/*

    PIERRE DE ROSETTE DES COMMUNICATIONS DE LA PROTOBOARD

    Ici on définit la structure des communications entre les deux copains.
    Le traitement des informations est le besoin de réponse seront entièrement traités
    à l'intérieur de l'engine du jeu. À terme ce sera des fonctions d'une librairie custom.
    
    Limite de longueur testée : 200
    BackToBack : OK


    --- --------- --- 
    --- RECEPTION --- 
    --- --------- --- 

      "T-3-154"
        - T = Message de changement de valeur sur une tuile
        - Numéro de la tuile
        - Valeur de la lecture


    --- ----- --- 
    --- ENVOI --- 
    --- ----- --- 

      "L-3:4:5-1-FF00FF-300"
        - Operation type > L = LIGHT LED
        - Numéro des tuiles concernée (avec separateur ":")
        - Quelle LEDs
            1  - 1000    2 - 3
            2  - 0100    |   |
            3  - 1100    1   4
            4  - 0010
            5  - 1010
            6  - 0110
            7  - 1110
            8  - 0001
            9  - 1001
            10 - 0101
            11 - 1101
            12 - 0011
            13 - 1011
            14 - 0111
            15 - 1111
        - Couleur HEX à aller
        - Millisecondes pour fade. Pas implémenter, pour l'instant mettre "0"

*/

