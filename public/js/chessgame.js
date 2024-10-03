// alert("BROWSER SIDE JAVASCRIPT")

//SOCKET IO FROM FRONT END
//WHENEVER WEBSITE GETS LOADED THEN JS WILL RUN THEN BELOW LINE WILL GET EXECUTED
//THEN AUTIMATICALLY WEBSITE WILL GET CONNECTED TO BACKEND AND WILL BE RECEIVED ON io.on("connection")
const socket=io()

// WE EMIITED MSG EVENT FROM BROWSER
// socket.emit("msg")
// //RECEIVED FROM BACKEND
// socket.on("sentmsg",function(){
//     console.log("MSG RECEIVED FROM BACKEND")
// })

//REQUIRE THE CHESS JS ENGINE
const chess=new Chess();

do{
    user=prompt("PELASE ENTER UR NAME")
}while(!user)


//ACESS CEHSSBOARD
const boardElement=document.querySelector(".chessboard")
const name=document.querySelector(".name")

//DRAGGED PEICE
let draggedPiece=null;
//SOURCE SOURCE POSITION BEFORE U MOVED UR HORSE,QUEEN,KING
let sourceSquare=null;
//INITIALLY WHEN THE WEBSITE GETS RENDER  THE PLAYER ROLE IS NULL MEANS IT IS NOT ASSIGNED WITH ANY WHITE OR BLACK ROLE
let playerRole=null

//FUNCTIONS CLIENT SIDE
//Generate the HTML representation of the chessboard based on the current game state.
const renderBoard=()=>{
    // WITH THE HELP OF CHESS.BOARD() WE GET ALL THE INITIAL POSITONS OF BOARD WHERE WILL BLACK AND WHITE HORSE QUEEN KING WILL STAND
    const board=chess.board();
    boardElement.innerHTML="";
    
    console.log("INITAL POSITIONS OF ALL PIECES(KING,HORSE,QUEEN)->",board)
    
    // MEANs HOW MAY HORIZONTAL LINES PRESNT ON CHESS BOARD AND columns MEANS HOW MANY VERTICAL LINES PRESENT ON CHESS BOARD
    board.forEach((row,rowindex) => {
       console.log("ROW INDEX NO->",rowindex,"ROW->",row)
       row.forEach((square,squareindex)=>
        {           
            //SQAURE MEANS BOX WHERE THE PEICES STAND BLACK AND WHITE BOXES
            console.log("SQUARE->",square)
            //BLACK AND WHITE BOX PATTERN
            //CREATE DIV ELEMENT
            const squareElement=document.createElement("div")
            //ADD CLASS TO squareElement 
            //FIRST CLASSNAME IS SQUARE WHILE SECOND CLASSNAME CAN BE DECIDED BASED ON LOGIC IF ROW INDEX IS 0(THAT IS 0TH ROW)AND SQAUREINDEX IS 0(THAT IS O TH SQUARE BOX)THEN FIRST BOX(SQUARE) COLOR WILL BE LIGHT
            //SQUARE KO KONSA COLOR DENA
            squareElement.classList.add(
                "square",
                (rowindex+squareindex)%2===0 ?"light":"dark"
            );
            

            //GIVE EVERY SQUAREELEMENT A VALUE THAT WILL DETERMIN THE POSITION OF SQUAREELEMENT
            //MEANS AT WHICH POSITION SQAURE IS THERE ROWINDEX=0 AND COLINDEX=1  MEANS 1STROW AND SECOND COLUMN
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;
            console.log("r",squareElement.dataset.row,"c",squareElement.dataset.col)

            //PIECES ON SQUARE
            //FORMAT OF ROW AND SQUARE WILL BE ROW0=[{SQUARE1},{SQUARE2},{SQUARE3}...,{SQUARE8}]
            //EACH {SQUARE} CONTAINS {type:'r',color:'b'} TYPE REFERS TO PIECE TYPE COLOR REFERS TO PIECE COLOR
            //THEN CREATE ELEMENT DIV FOR PIECE
            //ADD CLASS TO IT FIRST CLASSNAME WILL BE PIECE AND SECOND CLASSNAME BE BASED ON SQUARE.COLOR 
            //if(Square) MEANS SQUARE WHICH TYPE ARE NOT NULL THEN ADD PIECES ON IT
            if(square)
            {
                const pieceElement=document.createElement("div")
                //PIECE KO KONSA COLOR MAINLY DEPENDS ON SQUARE KE COLOR PAR
                pieceElement.classList.add(
                    "piece",
                    square.color==="w"?"white":"black"
                )
            
                //EMOJIS(SYMBOLS) OF PIECES THAT WE WILL GET FROM getPieceUnicode(square)
                pieceElement.innerText=getPieceUnicode(square);

                //DRAGGABLE LOGIC
                //WE GET PLAYERROLE FROM BACKEND IF PLAYERROLE="w" AND SQAURE.COLOR="w" THEN IT RETURNS TRUE THUS THE PIECE ELEMENT IS DRAGGABLE
                //AGAR PLAYER KA ROLE WHITE AHE THO PLAYER WHITE PIECES KO AGE PICHE KAR SAKTE AHE
                //ELSE FALSE THEN NOT DRAGGABLE
                pieceElement.draggable=playerRole===square.color;
                console.log("pieceElement.draggable->",pieceElement.draggable)
                
                //HERE dragstart IS AN EVENT IF THIS EVENT OCCURS THEN THEN CARRY OUT FOLLOWING CODE
                pieceElement.addEventListener("dragstart",(e)=>
                {
                    if(pieceElement.draggable)
                        {
                            draggedPiece=pieceElement
                            console.log(" draggedPiece",draggedPiece)
                            //DETERMINE THE POSITION OF PEICE ON BOARD BASICALLY IT TELLS FROM WHICH POSTION IT IS DRAGGABLE
                            //EG:-sourceSquare={row:0,col:0} 0th row and 0th column means starting box MEANS VAHA SE PIECE DRAG HUA AHE AAGE
                            sourceSquare={row:rowindex,col:squareindex}
                            //TO MAKE DRAGS WORK PROPERLY
                            e.dataTransfer.setData("text/plan","")

                            //pieceElement.classList.add("dragging");

                            console.log("Drag started from", sourceSquare);
                        }
                })
                pieceElement.addEventListener("dragend",(e)=>
                {
                    //pieceElement.classList.remove("dragging");
                    draggedPiece=null;
                    sourceSquare=null;
                    console.log("Drag ended");

                })
                //NOW ADD UR PIECE TO SQUAREELEMENT DIV
                squareElement.appendChild(pieceElement)  
            }

            //DONT ALLOW THE SQUARE ELEMENT TO DRAGED BY USER 
            squareElement.addEventListener("dragover",function(e)
            {
                e.preventDefault();
                console.log("Dragover event");
            })


            //WHEN U DROP PIECE ON SQUARE THEN GET THE TARGETSOURCE WHERE THE PIECE HAS BEN DROPEED
            //TARGETSOURCE IS NOTHING BUT THE POSITONS WHERE PIECE HAS BEEN DROPPED
            squareElement.addEventListener("drop",function(e)
            {
                e.preventDefault()
                if(draggedPiece)
                {
                    const targetSource=
                    {
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col),
                    }
                    console.log("sourceSquare,targetSource->",sourceSquare,targetSource)
                    //KAHA SE KAHA MOVE KIYA AHE PIECE KO ON BOARD
                    //MEANS PIECE KA SOURCEPOSITOIN AND PIECE KA TARGETPOSITION
                    handleMove(sourceSquare,targetSource)

                }
            })
            //NOW ADD ALL SQUARE PATTERN IN BOARDELEMENT
            boardElement.appendChild(squareElement)
        })
        
    });

   if(playerRole==="b"){
   name.innerText=`WELCOME ${user} U HAVE BLACK TURN`
    boardElement.classList.add("flipped")
   }
   else{
    name.innerText=`WELCOME ${user} U HAVE WHITE TURN`
    boardElement.classList.remove("flipped")
   }

}

const handleMove=(source,target)=>{
    //MOVING THE PIECE FROM ONE SQUARE TO ANOTHER SQUARE
    //COLS ARE REFERRED WITH LETTERS(aTOh) AND ROWS ARE REFEERED WITH NUMBERS(1TO8)
    //STRING.fromCharCode(97+column_value)BASICALLY IT GIVES CAHRACTER 'a TO h' 
    //$(8-source.row) BASICALLY GIVES ROWS(1TO8)
    //STRING.fromCharCode(97+column_value)$(8-source.row) THEN BASICALLY GIVES (COLUMN)(ROW) MEANS 1STCOLUMN AS "a" AND  1STROW AS "8" 
    //from:`${String.fromCharCode(97+source.col)}${8-source.row}`, SOURCE FROM WHICH PIECE HAS BEEN MOVE
    //to:`${String.fromCharCode(97+target.col)}${8-target.row}`,   WHERE THE PIECE HAS BEEN DROPPED
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    console.log("from/to",String.fromCharCode(97+source.col),8-source.row)
    console.log("HI BUDDY")
    //SENDING MESSAGES FROM CLIENT SIDE TO SERVER
    socket.emit("move",move)
}

//THIS FUCTION IS FOR ADDING SYMBOLS OF PIECES IN PIECELEMENT
//IN RENDER BOARD WE CALL getPieceUnicode() FUNCTION AND PASSED SQUARE TO IT 
//SQUARE IS BASICALLY CONTAINS {type:'r',color:'b'}
// const unicodePieces={} BASICALLY OBJECT 
//IF square.type='r' THNE BELOW FUNCTION WILL RETURN unicodePieces[square.type] THAT IS unicodePieces["r"] 
//unicodePieces["r"]  IS NOTHING BUT "♜"
const getPieceUnicode=(piece)=>{
    const unicodePieces=
    {
    p: "♙",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    }
    return unicodePieces[piece.type] || ""

}

function im(move)
{
    console.log("Invalid move! Please try again.")
}

//SOCKET CLIENT SIDE METHODS
//MSGS FROM SERVER  
socket.on("playerRole",function(role){
    playerRole=role
    renderBoard()
})

socket.on("spectatorRole",function(playerRole){
    playerRole=null
    renderBoard()
})

//PLEASE LOAD THE NEW BOARDSTATE 
socket.on("boardState",function(fen){
    chess.load(fen)
    renderBoard()
})

socket.on("move",function(move){
    chess.move(move)
    renderBoard()
});

socket.on("invalidMove",function(move){
    // chess.move(move)
    // renderBoard()
    im(move)
});


renderBoard()




//ALLOW USERS TO FRAGE HORES PON KING QUEEN ONLY WHEN USER TURN IS THERE IF NOT DONT ALLOW IT

