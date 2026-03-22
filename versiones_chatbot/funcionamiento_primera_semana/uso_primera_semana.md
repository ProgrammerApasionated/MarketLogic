# _“No hace falta tenerlo todo claro para empezar; hace falta empezar para tenerlo claro.”_
# Primera Semana — Inicio del Proyecto
Para empezar a construir el proyecto, lo primero fue comprobar que realmente es viable y que podemos desarrollarlo en 8 semanas sin tener conocimientos avanzados sobre la materia.
Esta primera fase ha servido para:
- Sentar las bases técnicas.
- Asegurar que el sistema puede crecer de forma ordenada.
- Preparar una estructura sólida para añadir lógica y contenido más adelante.
---
## Estado actual
A día de hoy, ya contamos con un backend funcional que:
- Recibe la respuesta del usuario desde el frontend.
- Devuelve un resultado en formato JSON.
Actualmente, la respuesta es simple:
- **"Has dicho :  + respuesta del usuario "**

Aunque es algo básico, es una prueba clave de que:
- La comunicación frontend-backend funciona correctamente.
- La estructura está lista para construir la lógica real del chatbot.

---

## Lógica actual

El sistema se divide en varias partes:

### Backend
- Archivo principal: `server.js`
- Función: iniciar el servidor en `http://localhost:3000`
- Es la parte **lógica y estructural** del sistema.

### Frontend
- HTML + CSS → interfaz visual.
- `app.js` → gestiona la interacción.

### Flujo de funcionamiento

1. El usuario escribe un mensaje.
2. `app.js` recoge ese mensaje.
3. Se envía al servidor (`server.js`).
4. El servidor genera una respuesta.
5. La respuesta vuelve al frontend.
6. Se muestra en pantalla.
---
## Resumen
- El servidor → parte rígida y lógica.
- La interfaz + app → parte dinámica y visual.
Ambas trabajan juntas para:
- Mostrar lo que escribe el usuario.
- Mostrar la respuesta generada por el sistema.
---
## Funcionamiento
Para ejecutar el proyecto correctamente:
### 1. Abrir la terminal
Situarse en la carpeta del backend:

```bash
cd ./backend/
```
### 2. Iniciar el servidor
- Es necesario tener Node.js instalado.
```bash
node ./server.js
```
- Si todo funciona correctamente, aparecerá:
``` bash
>>> ESTE ES EL SERVER CORRECTO <<<
Servidor funcionando en http://localhost:3000
```
### 3. Abrir el frontend
- Abrir el archivo index.html en el navegador.
- Con el servidor activo:
La interfaz cargará correctamente.
Se podrán enviar mensajes.
El sistema responderá en tiempo real.