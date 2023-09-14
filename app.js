const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializer();
const  convertDbObjectToResponseObject = (object) =>({
        playerId : object.player_id,
        playerName : object.player_name,
        jerseyNumber : object.jersey_number,
        role : object.role,
});

//Returns a list of all players in the team
app.get("/player/", async(request,response)=>{
    const getCricketTeam = 
    `SELECT 
        *
     FROM 
        cricket_team
     ORDER BY 
        player_id;`;
    const cricket = await db.all(getCricketTeam);
    response.send(cricket.map((each) =>
        convertDbObjectToResponseObject(each);
    ));
});

//Creates a new player in the team (database). `player_id` is auto-incremented
app.post("/player/", async(request,response)=>{
    const playerDetails = request.body;
    const {playerName,jerseyNumber,role} = playerDetails;
    const newPlayers = 
    `INSERT INTO
        cricket_team (player_name,jersey_number,role)
    VALUES (${playerName},
        ${jerseyNumber},
        ${role});`;
    const addCricket = await db.run(newPlayers);
    const addedId = addCricket.lastId
    response.send("Player Added to Team");
});

//Returns a player based on a player ID
app.get("/players/:playerId/",async(request,response)=>{
    const {playerId} = request.params;
    const playersQuery = 
    `SELECT 
        *
     FROM 
        cricket_team
     WHERE 
        player_id = ${playerId};`;
     const team = await db.get(playersQuery);
    let a = {
        playerId: team.player_id,
        playerName: team.player_name,
        jerseyNumber: team.jersey_number,
        role: team.role,
    };

     response.send(a);
});

//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/",async(request,response)=>{
     const {playerId} = request.params;
      const playerDetails = request.body;
      const {playerName,jerseyNumber,role} = playerDetails;
      const updateQuery = 
      `UPDATE 
        cricket_team
      SET
        player_name = ${playerName},
        jersey_number = ${jerseyNumber},
        role = ${role}
      WHERE 
        player_id = ${playerId};`;
      await db.run(updateQuery);
      response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async(request,response)=>{
    const{playerId} = request.params;
    const deleteQuery = 
    `DELETE FROM 
        cricket_team
     WHERE 
        player_id = ${playerId};`;
     await db.run(deleteQuery);
     response.send("Player Removed");
});


module.exports =app;