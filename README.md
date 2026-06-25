# MarketLogic - X Edición Hackathon XarxaTec

**"El talento no es una cualidad estática; es una corriente que solo encuentra su verdadero valor cuando encuentra un canal donde fluir."**

MarketLogic es una solución desarrollada por un equipo de cuatro estudiantes de la Universitat Jaume I (UJI) durante la X Edición del Hackathon XarxaTec.

El proyecto nació como respuesta al reto planteado por la Cámara de Comercio y fue desarrollado a lo largo de varios meses de trabajo, mentorías y validaciones. La propuesta fue seleccionada como una de las finalistas de la competición.

Dentro del equipo participé como responsable técnico, colaborando en el diseño de la arquitectura del sistema, la implementación del chatbot y la integración entre los distintos componentes de la aplicación.

---

## Descripción

MarketLogic busca facilitar la conexión entre talento y tejido empresarial mediante un chatbot capaz de recopilar información sobre los usuarios y generar recomendaciones adaptadas a distintos perfiles.

El proyecto combina procesamiento básico de lenguaje natural, almacenamiento de datos, visualización de información y una interfaz web sencilla accesible desde el navegador.

---

## Características principales

* Chatbot desarrollado con NLP.js.
* API REST construida con Node.js y Express.
* Persistencia de datos mediante SQLite.
* Sistema de perfiles, preguntas y recomendaciones basado en archivos JSON.
* Interfaz web desarrollada con HTML, CSS y JavaScript.
* Módulo de análisis de datos en Python para explorar la información recopilada durante las pruebas.

---

## Arquitectura

### Backend

**Tecnologías:** Node.js, Express, NLP.js

El backend se encarga de:

* Gestionar las sesiones de usuario.
* Procesar las respuestas del chatbot.
* Coordinar el flujo conversacional.
* Exponer los endpoints utilizados por el frontend.

### Base de Datos

**Tecnologías:** SQLite y JSON

La información del sistema se almacena utilizando:

* `db.sqlite` para la persistencia de datos.
* `profiles.json` para los perfiles definidos.
* `questions.json` para las preguntas del flujo.
* `recommendations.json` para las recomendaciones generadas.

### Analítica de Datos

**Tecnologías:** Python, Pandas, Matplotlib y Seaborn

El directorio `analizar_Market` contiene diferentes notebooks y scripts utilizados para:

* Explorar los datos generados por el sistema.
* Limpiar y transformar registros.
* Analizar distribuciones de perfiles.
* Generar gráficos y visualizaciones.

### Frontend

**Tecnologías:** HTML5, CSS3 y JavaScript

La interfaz web permite interactuar con el chatbot desde el navegador mediante una aplicación ligera desarrollada sin frameworks externos.

---

## Estructura del Proyecto

```text
.
├── analizar_Market/
│   ├── data/
│   ├── notebooks/
│   ├── reports/
│   └── src/
│
├── backend/
│   ├── server.js
│   ├── nlp.js
│   ├── package.json
│   └── db.sqlite
│
├── database/
│   ├── profiles.json
│   ├── questions.json
│   └── recommendations.json
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── versiones_chatbot/
│
└── README.md
```

---

## Tecnologías Utilizadas

### Desarrollo Web

* HTML5
* CSS3
* JavaScript
* Node.js
* Express

### Procesamiento del Lenguaje Natural

* NLP.js

### Datos y Visualización

* Python
* Pandas
* Matplotlib
* Seaborn

### Persistencia

* SQLite

### Herramientas

* Git
* GitHub

---

## Instalación

### Requisitos

* Node.js 18 o superior
* npm
* Python 3

### Clonar el repositorio

```bash
git clone https://github.com/usuario/marketlogic.git
cd marketlogic
```

### Ejecutar el backend

```bash
cd backend

npm install
npm start
```

Por defecto el servidor estará disponible en:

```text
http://localhost:3000
```

### Ejecutar el módulo de análisis

Instalar dependencias:

```bash
pip install pandas matplotlib seaborn
```

Ejecutar los scripts o notebooks incluidos en `analizar_Market` según el análisis que se quiera realizar.

---

## Lo que aprendimos

Durante el desarrollo del proyecto trabajamos con conceptos que iban más allá de los contenidos que habíamos visto hasta ese momento en la carrera:

* Diseño básico de APIs REST.
* Gestión de estados en aplicaciones conversacionales.
* Procesamiento de lenguaje natural.
* Persistencia de datos con SQLite.
* Análisis y visualización de datos con Python.
* Trabajo colaborativo utilizando Git y GitHub.
* Presentación y defensa técnica de una solución ante un jurado.

---

## Equipo

Proyecto desarrollado por cuatro estudiantes de la Universitat Jaume I (UJI) durante la X Edición del Hackathon XarxaTec.

---

## Reconocimiento

MarketLogic fue seleccionado como proyecto finalista en la X Edición del Hackathon XarxaTec.


**"La mejor manera de predecir el futuro es inventándolo." — Alan Kay**