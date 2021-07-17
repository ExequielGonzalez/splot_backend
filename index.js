//npm install express --save
const express = require("express");
//npm install body-parser --save
const bodyParser = require("body-parser");
// npm i request
const request = require("request").defaults({ encoding: null });
const fsPromises = require("fs").promises;

const Constants = require("./constants.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let usuario = {
  nombre: "",
  apellido: "",
};
let response = {
  error: false,
  code: 200,
  message: "",
};
app.get("/", function (req, res) {
  response = {
    error: true,
    code: 200,
    message: "starting point",
  };
  res.send(response);
});
app
  .route("/photo/:id")
  .get(async function (req, res) {
    var id = req.params.id;
    console.log(id);
    console.log(Constants.CAMERAS_IP[id]);
    photoRequest(Constants.CAMERAS_IP[id], function (err, result) {
      if (err) {
        // res.send(500, { error: "something blew up" });
        res.status(500).send({ error: "something blew up" });
      } else {
        res.send(result);
      }
    });
  })
  .post(function (req, res) {
    if (!req.body.nombre || !req.body.apellido) {
      response = {
        error: true,
        code: 502,
        message: "El campo nombre y apellido son requeridos",
      };
    } else {
      if (usuario.nombre !== "" || usuario.apellido !== "") {
        response = {
          error: true,
          code: 503,
          message: "El usuario ya fue creado previamente",
        };
      } else {
        usuario = {
          nombre: req.body.nombre,
          apellido: req.body.apellido,
        };
        response = {
          error: false,
          code: 200,
          message: "Usuario creado",
          response: usuario,
        };
      }
    }

    res.send(response);
  })
  .put(function (req, res) {
    if (!req.body.nombre || !req.body.apellido) {
      response = {
        error: true,
        code: 502,
        message: "El campo nombre y apellido son requeridos",
      };
    } else {
      if (usuario.nombre === "" || usuario.apellido === "") {
        response = {
          error: true,
          code: 501,
          message: "El usuario no ha sido creado",
        };
      } else {
        usuario = {
          nombre: req.body.nombre,
          apellido: req.body.apellido,
        };
        response = {
          error: false,
          code: 200,
          message: "Usuario actualizado",
          response: usuario,
        };
      }
    }

    res.send(response);
  })
  .delete(function (req, res) {
    if (usuario.nombre === "" || usuario.apellido === "") {
      response = {
        error: true,
        code: 501,
        message: "El usuario no ha sido creado",
      };
    } else {
      response = {
        error: false,
        code: 200,
        message: "Usuario eliminado",
      };
      usuario = {
        nombre: "",
        apellido: "",
      };
    }
    res.send(response);
  });
app.use(function (req, res, next) {
  response = {
    error: true,
    code: 404,
    message: "URL no encontrada",
  };
  res.status(404).send(response);
});
app.listen(3000, () => {
  console.log("El servidor está inicializado en el puerto 3000");
});

// ip = 192.168.43.222
// async function photoRequest(ip) {
//   const time = +new Date();
//   var photo;
//   request(
//     `http://${ip}/web/auto.jpg?-usr=admin&-pwd=admin&`,
//     { json: true },
//     async (error, response, body) => {
//       if (error) {
//         return console.log(error);
//       }
//       if (!error && response.statusCode === 200) {
//         console.log(response.statusCode);
//         photo = response.body;

//         console.log(response.body);

//         //   photo = res.body;
//       }
//     }
//   );
// }

async function savePhoto(photo) {
  const time = +new Date();
  await fsPromises.writeFile(`./images/${time}.jpg`, photo, function (error) {
    if (error) throw error;
    console.log("Saved!");
  });
}

var photoRequest = function (ip, callback) {
  request(
    `http://${ip}/web/auto.jpg?-usr=admin&-pwd=admin&`,
    { json: true },
    async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        savePhoto(response.body);
        status = "succeeded";
        callback(null, { status: status, photo: response.body });
      } else {
        callback(error);
      }
    }
  );
};
