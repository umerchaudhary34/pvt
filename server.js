const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const now = new Date();
// Format the date as "yyyy-mm-dd"
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, "0");
const day = now.getDate().toString().padStart(2, "0");
const date = `${year}-${month}-${day}`;
// Format the time as "hhmmss"
const hours = now.getHours().toString().padStart(2, "0");
const minutes = now.getMinutes().toString().padStart(2, "0");
const seconds = now.getSeconds().toString().padStart(2, "0");
const time = `${hours}${minutes}${seconds}`;
// Combine the date and time into a single string
const dateTime = `${date}_${time}`;

app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname + "/public/uploads/"));
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = `${dateTime}`;
        cb(null, dateTime + path.extname(file.originalname));
    }
});

const multerUploader = multer({ storage: storage });
const upload = multerUploader.single("file");

app.post("/upload/csv", function (req, res) {
    upload(req, res, function (err) {
        let file = req.file;
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: err.message });
        } else if (err) {
            return res.status(500).json({
                success: false,
                message: "An error occurred"
            });
        }
        // Get the path of the uploaded file
        const filePath = path.join(__dirname, "public/uploads", file.filename);
        const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            url: fileUrl
        });
    });
});

app.use(express.static(__dirname + "/public"));

app.listen(3000, function () {
    console.log("Server started at http://localhost:3000");
});
