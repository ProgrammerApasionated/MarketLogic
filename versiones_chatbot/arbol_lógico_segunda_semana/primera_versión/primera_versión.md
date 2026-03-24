_“A veces el camino se aclara solo cuando decides avanzar.”_

# Segunda semana – Construcción del Flujo

Para esta semana, nuestro objetivo es, mediante unos perfiles creados, definir el flujo que nuestro chatbot seguirá.  
Concretamente, hemos creado 4 posibles perfiles, cada uno con ambiciones, intereses y formas de pensar distintas.
La idea es que, a partir de estos perfiles, podamos encuadrar los gustos personales del usuario en una futura profesión que encaje con él.
---
## Perfiles
En la carpeta `docs/perfiles.pdf` se encuentran los perfiles que hemos definido.  
En este documento tenemos a 4 estudiantes ficticios, cada uno representando un tipo de orientación distinta.
- **Jesús → Perfil analítico/tecnológico**  
  Interesado en ciencias, números, retos académicos y carreras exigentes. Representa al estudiante que disfruta del pensamiento lógico y la resolución de problemas.
- **Lucía → Perfil creativo**  
  Con inclinación hacia el diseño, la expresión visual y las herramientas artísticas. Representa a quienes buscan una profesión donde puedan crear, comunicar y explorar ideas.
- **Carlos → Perfil sanitario**  
  Vocacional, disciplinado y orientado a ayudar a los demás. Representa a quienes sienten interés por medicina, enfermería o cualquier rama relacionada con la salud.
- **Alejandro → Perfil tecnológico/emprendedor**  
  Con mezcla de ingeniería, negocios y ganas de emprender. Representa a quienes buscan crear proyectos, liderar ideas y combinar tecnología con gestión.
---
## Diseño del flujo
A partir de estos perfiles, hemos construido la primera versión del flujo del chatbot, que será la base para la lógica final.
Esta versión incluye:
- Mensaje de bienvenida  
- Bloque de preguntas base *(pendientes de contenido)*  
- Nodo de clasificación inicial  
- Ramas específicas para cada perfil  
- Mensajes de transición  
- Recomendación final personalizada  
El objetivo de esta semana era tener la estructura, aunque algunas partes aún estén vacías.  
Y eso ya está conseguido.
---
## Preguntas base (pendiente)
En esta versión inicial, las preguntas base aparecen como “pendiente”.
Esto es así porque dependen del contenido que deben entregar mis compañeros:
- Las 5 preguntas generales  
- Las respuestas típicas  
- Las palabras clave asociadas  
Una vez tenga ese material, podré completar esta parte y conectar la lógica de clasificación.
---
## Clasificación inicial
El nodo de clasificación es el “cerebro” del flujo.  
Aquí es donde, a partir de las respuestas del usuario, se decidirá a qué perfil se acerca más.
En esta versión, la lógica está marcada como “pendiente”, ya que requiere:
- Palabras clave  
- Respuestas modelo  
- Tabla de equivalencias  
- Sistema de puntuación  
Todo esto se añadirá en cuanto recibamos el contenido faltante.
---
## Ramas específicas
Cada perfil tiene su propia rama con:
- Un mensaje de transición  
- Tres preguntas específicas  
- Un nodo final de agradecimiento  
- Una recomendación personalizada  
Estas ramas ya están completas y representan la parte más sólida del flujo actual.
---
## Estado actual del proyecto
En esta primera versión del flujo:
- La estructura general está terminada  
- Las ramas específicas están completas  
- La experiencia de usuario está definida  
- Los mensajes de transición están integrados  
- Solo faltan las preguntas base, respuestas típicas y palabras clave  

Una vez tengamos esos elementos, podré:
- Completar los nodos vacíos  
- Implementar la lógica de clasificación  
- Conectar cada respuesta con un perfil  
- Cerrar el flujo final  
---
## Reflexión de esta etapa

Esta semana ha sido más de ordenar, estructurar y preparar el terreno que de cerrar cosas.  
Pero es una parte necesaria: ningún proyecto empieza completo, y esta fase es la que permite que todo lo demás encaje después.

**Capturas con el estado actual en la carpeta `arbol_lógico_segunda_semana/primera_versión`**