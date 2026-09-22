const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

// ==============================
// DIRECTORIES
// ==============================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


// Serve frontend
app.use(express.static(__dirname));


// Serve uploaded videos
app.use(
    "/uploads",
    express.static(uploadDir)
);


// ==============================
// MULTER STORAGE
// ==============================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadDir);

    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const filename =
            "video-" +
            Date.now() +
            extension;

        cb(null, filename);

    }

});


const upload = multer({

    storage: storage,

    limits: {

        fileSize:
            200 * 1024 * 1024

    },

    fileFilter: function (req, file, cb) {

        if (
            file.mimetype &&
            file.mimetype.startsWith("video/")
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only video files are allowed."
                )
            );

        }

    }

});


// ==============================
// HOME
// ==============================

app.get("/", function (req, res) {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


// ==============================
// HEALTH CHECK
// ==============================

app.get("/api/health", function (req, res) {

    res.json({

        success: true,

        message:
            "AI Video Editor backend is running."

    });

});


// ==============================
// VIDEO UPLOAD
// ==============================

app.post(
    "/api/upload",
    upload.single("video"),
    function (req, res) {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No video file received."

                });

            }


            console.log(
                "Video uploaded:",
                req.file.filename
            );


            return res.json({

                success: true,

                message:
                    "Video uploaded successfully.",

                video: {

                    filename:
                        req.file.filename,

                    path:
                        "/uploads/" +
                        req.file.filename,

                    size:
                        req.file.size,

                    type:
                        req.file.mimetype

                }

            });

        } catch (error) {

            console.error(
                "Upload error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Video upload failed."

            });

        }

    }
);


// ==============================
// AI GENERATE
// ==============================

app.post(
    "/api/generate",
    function (req, res) {

        try {

            const {
                video,
                filename,
                prompt,
                strength
            } = req.body;


            if (!video) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Video is required."

                });

            }


            if (
                !prompt ||
                !prompt.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Prompt is required."

                });

            }


            console.log(
                "=========================="
            );

            console.log(
                "AI VIDEO REQUEST"
            );

            console.log(
                "Video:",
                video
            );

            console.log(
                "Filename:",
                filename
            );

            console.log(
                "Prompt:",
                prompt
            );

            console.log(
                "Strength:",
                strength
            );

            console.log(
                "=========================="
            );


            const jobId =
                "job-" +
                Date.now();


            return res.json({

                success: true,

                status:
                    "queued",

                jobId:
                    jobId,

                message:
                    "Video received successfully. AI processing is ready to be connected."

            });

        } catch (error) {

            console.error(
                "Generate error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Generation request failed."

            });

        }

    }
);


// ==============================
// 404 API HANDLER
// ==============================

app.use(
    "/api",
    function (req, res) {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


// ==============================
// GLOBAL ERROR HANDLER
// ==============================

app.use(
    function (err, req, res, next) {

        console.error(
            "Server error:",
            err
        );


        if (
            err instanceof multer.MulterError
        ) {

            return res.status(400).json({

                success: false,

                message:
                    err.message

            });

        }


        return res.status(500).json({

            success: false,

            message:
                err.message ||
                "Server error."

        });

    }
);


// ==============================
// START SERVER
// ==============================

app.listen(
    PORT,
    function () {

        console.log(
            "================================"
        );

        console.log(
            "AI Video Editor server running"
        );

        console.log(
            "Port:",
            PORT
        );

        console.log(
            "================================"
        );

    }
);