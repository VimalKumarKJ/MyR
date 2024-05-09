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
        const gameinfo_id = await db.query("SELECT id FROM gameinfo ORDER BY id DESC LIMIT 1");
        const tableId = gameinfo_id.rows[0].id;
        console.log(tableId);

        const result = await db.query("SELECT * FROM gameinfo");
        gameinfo = result.rows;
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
        res.send("Image URLs and developer information updated successfully.");
    } catch (error) {
        console.error("Error updating image URLs:", error);
        res.status(500).send("Error updating image URLs.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});