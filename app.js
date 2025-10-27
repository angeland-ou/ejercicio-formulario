// Importamos el módulo 'express', que permite crear un servidor web fácilmente.
const express = require("express");

// Creamos una instancia de la aplicación Express.
const app = express();

// Importamos 'path' (módulo nativo de Node.js) para trabajar con rutas de archivos del sistema.
const path = require("path");

// Definimos el puerto en el que escuchará el servidor.
const PORT = 3000;


// ---------------------------------------------------------
//  MIDDLEWARES (funciones que se ejecutan antes de las rutas)
// ---------------------------------------------------------

//    Servir archivos estáticos (HTML, CSS, JS, imágenes, etc.)
//    Esto permite que el navegador pueda acceder a archivos dentro de la carpeta "public".
//    Por ejemplo: http://localhost:3000/style.css  buscará en public/style.css
app.use(express.static(path.join(__dirname, "public")));


//    Configuramos el motor de plantillas EJS.
//    Esto le indica a Express que los archivos de vista (en la carpeta "views")
//    usarán la sintaxis de EJS (.ejs) en lugar de HTML puro.
app.set("view engine", "ejs");


//    Middleware para procesar datos enviados desde formularios HTML (method="POST").
//    - 'extended: true' permite analizar estructuras anidadas (ej. objetos dentro de objetos).
//    - Sin esto, `req.body` vendría vacío.
app.use(express.urlencoded({ extended: true }));

//    Middleware para procesar peticiones con JSON (por ejemplo, APIs REST).
app.use(express.json());

app.use((req,res,next) => {
    const ms = 1000; //10seg
    const timer = setTimeout(() => {
        // si no se han enviado cabeceras:
        if(!res.headersSent){
            // console log de un mensaje de advertencia
            console.warn("El tiempo de espera se ha agotado");
            res.status(408).send("(status) Tiempo de espera agotado");
        }
    }, ms);

    // ante el evento que le pasemos de primer parametro(finish -> acabe el timer),
    // lanzamos la función que le pasamos de segundo parametro
    res.once("finish", () => clearTimeout(timer));
    res.once("close", () => clearTimeout(timer));

    // next es una funcion que utiliza express
    // es para que no se quede pillado el servidor y continue al siguiente middleware
    // middleware --> microacciones en las que se divide el proceso del servidor
    // login...
    
    next();


});

// ---------------------------------------------------------
//   RUTA GET → Muestra el formulario vacío al usuario
// ---------------------------------------------------------
app.get("/form", (req, res) => {

    // Renderiza la plantilla "form.ejs" ubicada en /views.
    // Se le pasan valores iniciales vacíos para evitar errores de variables no definidas.
    res.render("form", {
        nombre: "",     // Campo de texto vacío
        edad: "",       // Campo numérico vacío
        ciudad: "",     // Selección de ciudad vacía
        intereses: []   // Array vacío (sin checkboxes marcados)
    });
});


// ---------------------------------------------------------
//   RUTA POST → Procesa los datos enviados desde el formulario
// ---------------------------------------------------------
app.post("/form", (req, res) => {

    // Extraemos los valores enviados desde el formulario.
    // req.body contiene todos los campos del formulario (gracias a express.urlencoded()).
    const nombre = req.body.nombre;
    const edad = req.body.edad;
    const ciudad = req.body.ciudad;

    // Si el usuario seleccionó varios intereses, llegarán como array.
    // Si solo eligió uno, llega como string , lo convertimos en array para unificar.
    let intereses = req.body.intereses || [];
    if (!Array.isArray(intereses)) { 
        intereses = [intereses]; 
    }

    // Creamos un array donde guardaremos los mensajes de error de validación.
    let errores = [];

    //  VALIDACIÓN 1: Nombre obligatorio y mínimo 2 caracteres.
    if (!nombre || nombre.trim().length < 2) {
        errores.push("El nombre tiene que tener mínimo 2 caracteres.");
    }

    //  VALIDACIÓN 2: Ciudad obligatoria (no puede quedar vacía).
    if (!ciudad) {
        errores.push("La ciudad no puede quedar vacía.");
    }

    // escenario numero 1: ha habido errores
    if (errores.length) {
        return res.status(400)
        .render("form", { nombre, edad, ciudad, intereses, errores });
    }

    //renderizamos una pagina nueva si no ha habido errores
    res.render("resultado", {
        nombre: nombre,
        edad: edad || null,  // si edad no está cubierta sería undefined así que enviamos un null
        ciudad : ciudad,
        intereses: intereses.length > 0 ? intereses : []  // si intereses tiene algún item enviamos intereses, sino enviamos un array vacío
    });
   
});




// ---------------------------------------------------------
// INICIO DEL SERVIDOR
// ---------------------------------------------------------
app.listen(PORT, () => {
    // Mensaje de confirmación en consola cuando el servidor está activo.
    console.log(`Servidor escuchando en: http://localhost:${PORT}`);
});
