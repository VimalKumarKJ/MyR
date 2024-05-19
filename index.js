import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "GameReviews",
    password: "vs2602",
    port: 5432,
});

db.connect();

async function updateGameDetails(game) {
    try {
        const response = await axios.get(`http://store.steampowered.com/api/appdetails?appids=${game.appid}`);
        const imageUrl = response.data[game.appid].data.header_image;
        const developerName = response.data[game.appid].data.developers;

        if (imageUrl && developerName && developerName.length > 0) {
            const developer = developerName[0];
            await db.query("UPDATE gameinfo SET developer = $1, imageurl = $2 WHERE appid = $3;", [developer, imageUrl, game.appid]);
        }
    } catch (error) {
        console.error("Error updating game details:", error);
    }
}

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT gameinfo.*, review.rating FROM gameinfo JOIN review ON review.game_id = gameinfo.id ORDER BY rating DESC");
        const games = result.rows;
        await Promise.all(games.map(updateGameDetails));
        res.render("index.ejs", { games });
    } catch (error) {
        console.error("Error fetching and updating game details:", error);
        res.status(500).send("Error fetching and updating game details.");
    }
});

app.get("/latest", async (req, res) => {
    try {
        const result = await db.query("SELECT gameinfo.*, review.rating FROM gameinfo JOIN review ON review.game_id = gameinfo.id ORDER BY id DESC");
        const games = result.rows;
        await Promise.all(games.map(updateGameDetails));
        res.render("latest.ejs", { games });
    } catch (error) {
        console.error("Error fetching and updating game details:", error);
        res.status(500).send("Error fetching and updating game details.");
    }
});

app.get("/title", async (req, res) => {
    try {
        const result = await db.query("SELECT gameinfo.*, review.rating FROM gameinfo JOIN review ON review.game_id = gameinfo.id ORDER BY gameinfo.name ASC");
        const games = result.rows;
        await Promise.all(games.map(updateGameDetails));
        res.render("latest.ejs", { games });
    } catch (error) {
        console.error("Error fetching and updating game details:", error);
        res.status(500).send("Error fetching and updating game details.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
