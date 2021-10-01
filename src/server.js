const path = require('path');
const fs = require("fs");
const express = require('express');
const { PORT, imageFolder } = require('./config');
const db = require('./entities/Database');
const Image = require('./entities/Image');
const url = require('url');
const { replaceBackground } = require("backrem");
var multer  = require('multer');
const { generateId } = require('./utils/generateId');
 
const app = express();

app.use(express.json());

app.get('/image/:id', (req, res) => {
    const imageId = req.params.id;
  
    return res.json(db.findOne(imageId).toPublicJSON());
});

app.delete('/image/:id', async (req, res) => {
    const imageId = req.params.id;
  
    const id = await db.remove(imageId);
  
    return res.json({ id });
});

app.get('/list', (req, res) => {
  const allImages = db.find().map((image) => image.toPublicJSON());

  return res.json(allImages);
});

app.get("/merge", (req, res) => {
    const mergeUrl = url.parse(req.url, true).query;

    const frontImage = fs.createReadStream(
        path.resolve(imageFolder, `./${mergeUrl.front}.jpg`)
    );
  
    const backImage = fs.createReadStream(
        path.resolve(imageFolder, `./${mergeUrl.back}.jpg`)
    );

    const color = [...mergeUrl.color.split(",")].map(elem => parseInt(elem));
    replaceBackground(frontImage, backImage, color, mergeUrl.threshold).then(
        (readableStream) => { 
            res.set({"Content-Type": "image/jpeg"});
            res.set({"Content-Disposition": "attachment"});
            readableStream.pipe(res);
        }
    );
}); 

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, imageFolder);
    },
    filename: function (req, file, cb) {
      cb(null, generateId()+'.jpg');
    }
});

var upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), function (req, res) {
    const image = new Image(req.file.filename.split('.')[0], req.file.size);
    db.insert(image); 

    res.send(JSON.stringify({id: image.id}));
});

app.listen(PORT);

