//npm install express --save
const express = require("express");

//npm install body-parser --save
// const bodyParser = require("body-parser");
// npm i request
const request = require("request").defaults({ encoding: null });
const fsPromises = require("fs").promises;

const HOST = "0.0.0.0";
const PORT = 3000;
let cameraData = [];

const app = express();
app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "Content-Type",
    "Authorization"
  );
  next();
});

app.get("/", function (req, res) {
  response = {
    error: true,
    code: 200,
    message: "starting point",
  };
  res.send(response);
});
app.route("/api/photo/:id").get(async function (req, res) {
  var id = req.params.id;
  console.log("taking photo with ", id);
  console.log(cameraData);
  const camera = cameraData.find((cam) => cam.name === id);
  console.log(camera);
  photoRequest(camera.name, camera.ip, function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});
app.route("/api/photo/last/:id").get(async function (req, res) {
  var id = req.params.id;

  readDir(id, function (err, result) {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.send(result);
    }
  });
});
app.use(function (req, res, next) {
  response = {
    error: true,
    code: 404,
    message: "URL no encontrada",
  };
  res.status(404).send(response);
});
app.listen(PORT, HOST, async () => {
  await readCamerasData((response) => {
    cameraData = response;
  });
  await readDirectories();
  console.log("Server started on port", PORT);
});

async function readCamerasFile() {
  try {
    const file = await fsPromises.readFile(
      "./config/cameras-ip.json",
      "utf-8",
      async function (error, data) {
        (error) => {
          throw error;
        };
      }
    );
    cameraData = JSON.parse(file);
  } catch (e) {
    console.log("There is not 'cameras-ip.json' file. ", e);
  }
}

async function readCamerasData(callback) {
  request(
    "http://backend-db:5000/api/v1/cameras",
    { json: true },
    async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body);
        //  const photoName = await savePhoto(id, response.body);
        //  status = "succeeded";
        callback(body);
      } else {
        callback({ status: "error", error: error });
        console.log("error");
      }
    }
  );
}

async function readDirectories() {
  try {
    const read = await fsPromises.readdir(
      `./images/`,
      async function (error, files) {
        (error) => {
          if (error) throw error;
        };
      }
    );
    if (read.length === 0) createDirectory();
  } catch (e) {
    console.log(e);
    if (e.code === "ENOENT" || e.code === "ENOTDIR") {
      try {
        createDirectory();
      } catch (e) {
        console.log(e);
      }
    }
  }
}

async function createDirectory() {
  // console.log("objeto con las camaras", cameraData);
  // Object.keys(cameraData).forEach(async (camera) => {
  //   console.log("aca debería crear las carpetas", camera);
  //   await fsPromises.mkdir(
  //     `./images/${camera}`,
  //     { recursive: true },
  //     (error) => {
  //       if (error) throw error;
  //     }
  //   );
  //   console.log(`Creado el directorio: /images/${camera}`);
  // });
  await fsPromises.mkdir("./images/", { recursive: true }, (error) => {
    if (error) throw error;
  });
  console.log("PATH created: ./images/");
}

async function savePhoto(camera, photo) {
  const time = +new Date();
  const photoName = `./images/${camera}-${time}.jpg`;
  await fsPromises.writeFile(photoName, photo, function (error) {
    if (error) throw error;
    console.log("Saved!");
  });
  return {
    camera: camera,
    cameraId: cameraData.find((cam) => cam.name === camera).id,
    name: `${camera}-${time}.jpg`,
  };
}

var readDir = async function (id, callback) {
  const file = await fsPromises.readdir(
    `./images/`,
    async function (error, files) {
      if (error) {
        callback(error);
      }
    }
  );
  if (file.length !== 0) {
    const photo = await fsPromises.readFile(
      `./images/${file[file.length - 1]}`,
      (error, data) => {
        if (error) throw error;
        callback(error);
      }
    );
    callback(null, { path: file[file.length - 1], photo: photo });
  } else {
    callback("There is no photo to show");
  }
};

var photoRequest = function (cameraName, ip, callback) {
  request(
    `http://${ip}/web/auto.jpg?-usr=admin&-pwd=admin&`,
    { json: true },
    async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const photoName = await savePhoto(cameraName, response.body);
        status = "succeeded";
        callback(null, { status: status, photo: photoName });
      } else {
        callback({ status: "error", error: error });
      }
    }
  );
};
