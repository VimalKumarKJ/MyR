import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "GameReviews",
    password: "vs2602",
    port: 5432,

});
db.connect();

let gameinfo = [];

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT gameinfo.*, ratings.rating FROM gameinfo JOIN ratings ON ratings.game_id = gameinfo.id ORDER BY rating DESC");
        gameinfo = result.rows;
        console.log(gameinfo);
        const gameId = gameinfo.map((game) => game.appid);
        for(const id of gameId){
            const response = await axios.get(`http://store.steampowered.com/api/appdetails?appids=${id}`);
            const imageUrl = response.data[id].data.header_image;
            const developerName = response.data[id].data.developers;

            if(imageUrl && developerName && developerName.length > 0){
                const developer = developerName[0];
                await db.query("UPDATE gameinfo SET developer = ($1) WHERE appid = $2;", [developer, id])
                await db.query("UPDATE gameinfo SET imageurl = $1 WHERE appid = $2;", [imageUrl, id]);
            }
        }
        res.render("index.ejs", {games : gameinfo})
    } catch (error) {
        console.error("Error updating image URLs:", error);
        res.status(500).send("Error updating image URLs.");
    }
});

app.get("/latest", async (req, res) => {
    try {
        const result = await db.query("SELECT gameinfo.*, ratings.rating FROM gameinfo JOIN ratings ON ratings.game_id = gameinfo.id ORDER BY id DESC");
        gameinfo = result.rows;
        console.log(gameinfo);
        const gameId = gameinfo.map((game) => game.appid);
        for(const id of gameId){
            const response = await axios.get(`http://store.steampowered.com/api/appdetails?appids=${id}`);
            const imageUrl = response.data[id].data.header_image;
            const developerName = response.data[id].data.developers;

            if(imageUrl && developerName && developerName.length > 0){
                const developer = developerName[0];
                await db.query("UPDATE gameinfo SET developer = ($1) WHERE appid = $2;", [developer, id])
                await db.query("UPDATE gameinfo SET imageurl = $1 WHERE appid = $2;", [imageUrl, id]);
            }
        }
        res.render("latest.ejs", {games : gameinfo})
    } catch (error) {
        console.error("Error updating image URLs:", error);
        res.status(500).send("Error updating image URLs.");
    }
});

app.get("/title", async (req, res) => {
    try {
        const result = await db.query("SELECT gameinfo.*, ratings.rating FROM gameinfo JOIN ratings ON ratings.game_id = gameinfo.id ORDER BY gameinfo.name ASC");
        gameinfo = result.rows;
        console.log(gameinfo);
        const gameId = gameinfo.map((game) => game.appid);
        for(const id of gameId){
            const response = await axios.get(`http://store.steampowered.com/api/appdetails?appids=${id}`);
            const imageUrl = response.data[id].data.header_image;
            const developerName = response.data[id].data.developers;

            if(imageUrl && developerName && developerName.length > 0){
                const developer = developerName[0];
                await db.query("UPDATE gameinfo SET developer = ($1) WHERE appid = $2;", [developer, id])
                await db.query("UPDATE gameinfo SET imageurl = $1 WHERE appid = $2;", [imageUrl, id]);
            }
        }
        res.render("latest.ejs", {games : gameinfo})
    } catch (error) {
        console.error("Error updating image URLs:", error);
        res.status(500).send("Error updating image URLs.");
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});