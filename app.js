const express=require('express')
const socket=require('socket.io')
const http=require('http')
const path=require('path')

//ONLY IMPORT CHESS CLASS FROM CHESS.JS
const {Chess}=require("chess.js")

//CREATE EXPRESS APP INSTANCE
//DO ROUTING SETUP
const app=express()

//INITALIZE HTTP SERVER WITH EXPRESS
const server=http.createServer(app)

//Instantiate Socket.io on HTTP server 
const io=socket(server)

//INITATE CHESS
//ALL CHESS FUNCTIONALITY ARE STORED IN chess OBJECT
const chess=new Chess()

// Initialize: 
//Players object,
//CurrentPlayer:SET CURRENT(STARTING) PLAYER AS WHITE
let players={};
let currentPlayer="w";

//SET MIDDLEWARE FOR EJS TEMPLATE AND USING PUBLIC FILE
app.set("view engine","ejs")
//SERVER WILL SERACH FOR EJS FILES IN /VIEWS FOLDER
app.set('views',path.join(__dirname,'/views'))
app.use(express.static(path.join(__dirname,"/public")))

//CREATING ROUTES
app.get("/",function(req,res){
    res.render("index.ejs",{title:"CHESS GAME"})
})

//SOCKET.IO FUNCTIONALITY
//SOCKET.IO CONNECTION FROM BACKEND
// io.on('connection',function(uniquesocketinfo){
//     console.log("WEBSITE(NEW CLIENT)CONNECTED SOCKET CONNECTION")
    
//     //HERE WE RECEIVER THE EMITTED EVENT THAT HAS BEEN SENT BY FRONTEND BROWSER
//     uniquesocketinfo.on("msg",function(){
//         //RECEIVED MSG FROM FRONTEND browser
//         console.log("RECEIVED MSG FROM FRONTEND browser")
        
//         //EMITTING MSG FROM BACKEND TO FRONTEND
//         uniquesocketinfo.emit("sentmsg")

//         //DISCONNECT CONNECTION BETWEEN  BACKEND AND FRONTEND ONCE  WEBSITE GETS CLOSED
//         uniquesocketinfo.on("disconnect",function(){
//             console.log("FRONTEND AND BACKEND CONNECTION GOT BROKE")
//         })
//     })
// })

//SOCKET.IO FUNCTIONALITY
//SOCKET.IO CONNECTION FROM BACKEND
//uniquesocket.id IS THE ID OF THE CLIENT THAT HAS BEEN CONNECTED TO SERVER
io.on("connection",function(uniquesocket)
{
    console.log("WEBSITE GETS CONNECTED")
    //THIS IS FOR FIRST PLAYER
    //IF PLAYERS OBJECT DOESNOT HAVE WHITE KEY(PROPERTIES) THEN MAKE IT AND THEN STORE VALUE IN IT players={white:uniquesocket.id}
    //THEN EMIT THE PLAYEROLE FROM BACKEND TO FRONTEND
    if(!players.white)
    {
        players.white=uniquesocket.id;
        uniquesocket.emit("playerRole","w")
    }
    //THIS IS FOR SECOND PLAYER
    //IF PLAYERS OBJECT DOESNOT HAVE BLACK KEY(PROPERTIES) THEN MAKE IT AND THEN STORE VALUE IN IT players={white:uniquesocket.id,black:uniquesocket.id}
    else if(!players.black){
        players.black=uniquesocket.id
        uniquesocket.emit("playerRole","b")
    }
    //IF WHITE AND BLACK KEY PRESENT THEN ALLOW THE THIRD PALYER TO SEE THE ONLY MATCH
    else{
        uniquesocket.emit("spectatorRole")
    }

    //DISCONNECT THE CONNECTION
    //WHENEVER BOTH OR ONE OF THIS PALYER THAT IS STARTING AND SECOND PLAYER GETS DISCONNECTED 
    //THEN DELETE THEIR SPECIFIC PROPERTIES THAT CAN PALYERS.WHITE OR PALYERS.BLACK FROM PALYERS OBJECT
    uniquesocket.on("disconnect",function()
    {
        //PLAYER WITH ASIGNED WHITE ROLE
        //AS U SEEN UPPER players.white or player.black is stored with unique socket id(person tha thas been connected)
        if(uniquesocket.id===players.white){
            delete players.white
        }
        //PLAYER WITH ASIGNED BLACK ROLE
        else if(uniquesocket.id===players.black){
            delete players.black
        }

    })

    //MOVES FUNCTIONALITY
    //SENT MOVE EVENT(HORSE,QUEEN MOVES) FROM FRONTEND TO BACKEND 
    uniquesocket.on("move",(move)=>
    {
        console.log("HI BUDDY",move)
        //NOW GET CHESS TURN FROM CHESS INSTANCE
        //IF CHESSTURN IS WHITE BUT THE ONE WHO HAS CONNECTED(THAT IS UNIQUESOCKETID)TAKES BLACK TURN  THEN RETURN IT IS NOT VALID TURN
        //AGAR WHITE HO THO WHITE CHALAO AGAR BLACK HO THO BALCK CAHLAO AGAR GALAT CHALAYA THO PIECE JAA PAE THA VAHA PAE CAHLEGA
        try{
            if(chess.turn()==="w" && uniquesocket.id!==players.white)return
            if(chess.turn()==="b" && uniquesocket.id!==players.black)return

            //NOW SEE WHETHER THE MOVE THAT HAS BEEN MADE BY USER IS VALID MOVE OR NOT
            //HORSE CAN MOVE 3 STEPS IF IT MOVE ONE STEP THEN IT IS AN INVALID MOVE
            const result=chess.move(move)
            console.log(result)
            //RESUTT CONTAINS VALUE OR ERROR
            //IF UR MOVE THAT HAS BEEN PROCEED BY STARTING OPONENT IS VALID THEN ALOOW UR FRONT OPPONENT TO CARRY OUT TURN IN TRY BLOCK
            //IF(VALID DMOVE)
            if(result){
                console.log(result)
                //THEN STORE NEXT TURN(OPPONENT) IN CURRENT PLAYERS
                currentPlayer=chess.turn()
                console.log("currentPlayer",currentPlayer)
                //IO.EMIT() BASICALLY EMITS MSG FROM BACKEND TO ALL CLIENTS(PALYER1,2,SPECTATOR) THAT ARE CONNECTED TO THE SERVER
                //UNIQUESOCKET.EMIT() EMITS MESSAGE FROM BACKEND ONLY TO THE ONE WHO HAS COONECTED WITH SERVER PRIVATE COONECTION MEANS MSG WILL BE SNET TO ONLY ONE NOT TO ALL CLIENTS
                //IF PLAYER1 CONNECTS THEN IT EMITS MSG TO PALYER1 ONLY 
                io.emit("move",move)
                //BASICALLY IT DETERMINE ALL HORSE,QUEEN,KING.. POSITONS ONCE A PLAYER MOVE ITS HORSE OR SOMETHING ELSE
                //MEANS IF PALYER 1 MOVES HORSE TO THREE STEPS THEN HORSE IS AT NEW POSITION THUS THSI NEW POSITON IN BOARD WILL BE EMIT TO ALL THE CLIENT WHICH HELP TO UNDERSTAND WHAT CURRENT BOARD STATTE
                io.emit("boardstate",chess.fen())
            }
            else{
                console.log("INVALID MOVE",move)
                uniquesocket.emit("invalidMove",move)
            }

        }
        catch(err){
            console.log(err.msg)
            //console.log("MOVE NOT RECOGNIZED By CHESS ENGINE",move)
            //uniquesocket.emit("INVALID MOVE",move)

        }
    })

})

//LISTEN SERVER ON PORT NUMBER 3000
server.listen(3000,function(req,res){
    console.log("SERVER CONNECTED")
})

