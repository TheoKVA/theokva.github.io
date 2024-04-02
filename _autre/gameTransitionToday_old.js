/*


      *   )                       )                *   )    (               
    ` )  /((      )         (  ( /((             ` )  /(    )\ )   ) (      
     ( )(_))(  ( /(  (    ( )\ )\())\  (   (      ( )(_)|  (()/(( /( )\ )   
    (_(_()|()\ )(_)) )\ ) )((_|_))((_) )\  )\ )  (_(_()))\  ((_))(_)|()/(   
    |_   _|((_|(_)_ _(_/(((_|_) |_ (_)((_)_(_/(  |_   _((_) _| ((_)_ )(_))  
      | | | '_/ _` | ' \)|_-< |  _|| / _ \ ' \))   | |/ _ Y _` / _` | || |_ 
      |_| |_| \__,_|_||_|/__/_|\__||_\___/_||_|    |_|\___|__,_\__,_|\_, (_)
                                                                     |__/ 


    ENGINE - TRANSITION TODAY

    Script principale du jeu Transition Today
    Ce script a vocation à être l'engine du jeu sur lequel viendront se fixer une scénariasation par la suite

    Ce script intègre une structure d'appel simple. 
    Pour l'instant je vais me concentrer à faire fonctionner les moulinettes qui exporteront les données vers l'HTML simplifié


*/


// --- ---------------------------- ---
// --- STRUCTURE DES VARIABLES CLÉS ---
// --- ---------------------------- ---
    /* 

    TABLEAU VILLE 
        ┌───┬───┬───┬───┬───┬───┬───┐
        │   │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │   [ ID PIECE, N° , STATUT ]
        ├───┼───┼───┼───┼───┼───┼───┤                      └─> STATUT 0 = PAS MIS DEFINITIVEMENT
        │ 0 │ 0 │ 0 │ 0 │[x]│ 0 │ 0 │                      └─> STATUT 1 = POSÈ                       
        ├───┼───┼───┼───┼───┼───┼───┤                      └─> STATUT 2 = À ENLEVER
        │ 1 │ 0 │ 0 │[x]│[x]│ 0 │ 0 │                      └─> STATUT - = PAS MIS SUR LA TABLE
        ├───┼───┼───┼───┼───┼───┼───┤
        │ 2 │ 0 │ 0 │ 0 │ 0 │ 0 │ 0 │
        └───┴───┴───┴───┴───┴───┴───┘


    TABLEAU DE CONSOMMATION DES SECTEURS

                       ├------- VARIABLES --------┤
                   ┌───┬──────┬────┬────┬────┬────┐
                   │   │   0  │  1 │  2 │  3 │  4 │      
              ─┬─  ├───┼──────┼────┼────┼────┼────┤
               |   │ 0 │ 27.2 │ 30 │ 29 │ 30 │ 11 │  [0] Menages 
               |   ├───┼──────┼────┼────┼────┼────┤  
               |   │ 1 │  18  │  9 │ 44 │ 41 │  6 │  [1] Industrie
      SECTEURS |   ├───┼──────┼────┼────┼────┼────┤ 
               |   │ 2 │ 17.1 │ 23 │ 25 │ 45 │  7 │  [2] Tertiaire      
               |   ├───┼──────┼────┼────┼────┼────┤  
               |   │ 3 │ 36.2 │ 94 │  0 │  4 │  2 │  [3] Transport  
              ─┴─  └───┴──────┴────┴────┴────┴────┘
                           │     │    │    │    │
                           │     │    │    │    └──> [4] Autre
                           │     │    │    └───────> [3] Elec
                           │     │    └────────────> [2] GazBois
                           │     └─────────────────> [1] Petrole
                           └───────────────────────> [0] EnergieTotal


    TABLEAU MODIFICATION DE PIÈCES = tablModifPieces
        ┌─                                                            ┐
        │ [ID PIECE, N°, STATUT], Secteur, Variable, ---------------- │
        │ [ID PIECE, N°, STATUT], Secteur, Variable, ---------------- │
        │ [ID PIECE, N°, STATUT], Secteur, Variable, ---------------- │
        │ [ID PIECE, N°, STATUT], Secteur, Variable, ---------------- │
        └─                                                            ┘


    TABLEAU MODIFICATIONS DES INVESTISSEMENTS = tablModifInvest
        ┌─                                                             ┐
        │ [ID INVEST, N°, STATUT]], Secteur, Variable, --------------- │
        │ [ID INVEST, N°, STATUT]], Secteur, Variable, --------------- │
        │ [ID INVEST, N°, STATUT]], Secteur, Variable, --------------- │
        │ [ID INVEST, N°, STATUT]], Secteur, Variable, --------------- │
        └─                                                             ┘
*/