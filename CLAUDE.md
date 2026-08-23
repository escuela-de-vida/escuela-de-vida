# PROMPT MAESTRO — "Escuela de Vida" (nombre de trabajo, código interno: Proyecto Brújula)

> **Qué es este documento:** es el prompt/spec de arranque para que **Claude Code** construya, de punta a punta, una plataforma privada de homeschooling gamificado para dos hermanos de 11 y 12 años, pensada desde el día uno para poder escalar a otras familias en el futuro. Contiene la visión del producto, el diseño de UX, el currículo de contenidos, el sistema de gamificación, la arquitectura técnica completa y un roadmap de fases ejecutable. Todo lo que hace falta para **empezar a programar sin más preguntas de descubrimiento** está acá adentro; lo que sí requiere una decisión humana está marcado explícitamente en la sección 12.
>
> **Cómo usarlo:** pegar este archivo completo como prompt inicial en un repo nuevo con Claude Code (o guardarlo como `CLAUDE.md`/`AGENTS.md` en la raíz del proyecto) y pedirle que ejecute el **Roadmap de fases** (sección 9) en orden, empezando por la Fase 0.

---

## Índice

1. Visión y filosofía del proyecto
2. Usuarios y roles
3. Mapa de producto (información arquitectónica)
4. Taxonomía completa de bloques/materias
5. UX: dashboard, panel de administración y mascota
6. Sistema de gamificación y puntaje
7. Currículo por materia
8. Arquitectura técnica y stack
9. Roadmap de construcción por fases (para que Claude Code lo ejecute)
10. Modelo de datos (ERD conceptual)
11. Multi-tenancy y escalabilidad futura
12. Supuestos ya decididos vs. decisiones pendientes de los padres
13. Riesgos, privacidad y consideraciones legales
14. Anexos (seed data: libros, países, citas, insignias)

---

## 1. Visión y filosofía del proyecto

Esto **no es una escuela tradicional**: es una **"escuela de vida"**. El objetivo no es reemplazar contenidos curriculares formales, sino transmitirles a los chicos un **esquema de organización de vida** que les sirva para siempre — cómo gestionar su tiempo, su energía, su mente y su cuerpo; cómo aprender a pensar críticamente; cómo relacionarse con su comunidad y con el mundo.

Principios rectores que **todo el diseño posterior debe respetar**:

- **Gestión del tiempo, no lista de tareas.** El corazón de la plataforma no es un to-do list: es un sistema de **batches de foco** (bloques de tiempo protegidos, tipo pomodoro) dedicados a una actividad puntual. Completar la tarea es una consecuencia de haber dedicado el tiempo con foco, no al revés.
- **Comparación contra uno mismo, nunca entre hermanos.** Todo el sistema de puntaje, ranking y feedback está diseñado para que cada chico compita con su propia versión de la semana pasada. El ranking entre pares existe pero es secundario y nunca aplasta.
- **El error no es una condena.** No hay puntos negativos ni "deudas". Lo que no se hace simplemente no suma; siempre hay ventana de recuperación.
- **Bienestar emocional por encima de la productividad.** Ningún mensaje, feedback automático o mecánica de puntos debe sugerir que el valor del chico depende de su desempeño.
- **Contenido edad-apropiado, neutral y sin adoctrinamiento.** Especialmente en desarrollo personal (sin pseudociencia presentada como hecho) y en geopolítica (sin lenguaje valorativo ni partidista).
- **Diseñada para escalar sin rediseñar.** Aunque hoy la usan 2 alumnos de una sola familia, cada decisión de datos y de producto (sección 8, 10, 11) está tomada pensando en que mañana pueda usarla cualquier familia, con su propio currículo personalizado.
- **Divertida, moderna y dinámica.** Estética de "expedición personal" (ver mascota y rangos en sección 5-6), no de plataforma escolar corporativa ni de app infantil de bebé.

---

## 2. Usuarios y roles

| Rol | Quién | Acceso |
|---|---|---|
| **Alumno (`student`)** | Cada uno de los dos hermanos, con su propio email/login | Dashboard personal, landing pages de materias, batch de foco, ranking, buzón de sugerencias, su propia bitácora |
| **Admin / padre (`parent_admin`)** | Ambos padres | Panel de administración completo: CRUD de categorías/tareas/libros, revisión de evidencias, override de puntajes IA, configuración de la mascota, progreso de cada hijo |
| **Alumno ficticio (`is_fictional=true`)** | No es una persona real; fila de datos para el ranking | Solo lectura, generado por el sistema (ver sección 6.6) |
| *(Futuro)* **Familia externa** | Otras familias que se sumen cuando la plataforma escale | Mismo modelo de roles, aislado por `family_id` (ver sección 11) |

Cada alumno se loguea con **su propio email** (magic link, sin contraseña que memorizar — apropiado para menores). Cada padre tiene su login de administrador separado.

---

## 3. Mapa de producto (información arquitectónica)

```
Login (email alumno / email admin)
│
├── VISTA ALUMNO
│   ├── Dashboard principal (heatmap de tareas, día/semana/mes/año)
│   │     └── Widget de celda → Batch de foco (timer) → Marcar hecho + evidencia
│   ├── Landing page por materia (una por cada bloque con currículo propio)
│   ├── Ranking (ícono discreto, no prioritario)
│   ├── Buzón de sugerencias (alumno → escuela)
│   ├── Bitácora de estudio (descarga PDF)
│   └── Perfil personal (racha, puntos, insignias, rango)
│
└── VISTA ADMIN (padres)
    ├── Gestión de categorías/materias
    ├── Gestión de tareas y plantillas (recurrencia, puntos, duración de batch)
    ├── Catálogo de libros
    ├── Reglas de puntos y niveles
    ├── Revisión de evidencias + override de evaluación IA
    ├── Progreso por hijo (gráficos)
    └── Configuración de la mascota/mensajes
```

---

## 4. Taxonomía completa de bloques/materias

Se consolidaron **las dos listas originales de los padres** (materias con landing propia + bloques de tiempo de la lista de la madre) en una sola taxonomía, resolviendo duplicados (ej. "aprendizaje" = landing **Mente**; "sports" = landing **Cuerpo**; "hablar en público" = materia **Public Speaking** + su práctica semanal).

### 4.1 Las 7 categorías madre (color del heatmap)

| Categoría | Color sugerido | Qué agrupa |
|---|---|---|
| **Mente** | Violeta | Mente, meditar, descansar, análisis/journaling diario |
| **Cuerpo** | Verde | Cuerpo, tai chi |
| **Conocimiento** | Azul | Matemáticas, Historia, Negocios, Computación, Lectura, Geografía, research |
| **Creatividad** | Naranja | Creatividad (paraguas), Pintura, Escritura Creativa, tiempo de arte, música |
| **Comunidad y Mundo** | Amarillo/dorado | Comunidad (paraguas), contactar al mundo, trabajo comunitario, limpiar el barrio, ayudar a alguien, excursión/viaje |
| **Vida Práctica** | Terracota/marrón | Higiene, Cocina, entrenamiento canino, tareas del hogar, dar feedback al colegio |
| **Comunicación** | Celeste/turquesa | Public speaking, mecanografía y dictado |

### 4.2 Tabla consolidada de bloques

| # | Bloque (ES/EN) | Categoría madre | Tipo | Frecuencia | Batch de foco | Puntos/sesión | Evidencia |
|---|---|---|---|---|---|---|---|
| 1 | Mente / Mind | Mente | Materia con landing | Diaria | 25 min | 15 | Texto (journal) |
| 2 | Cuerpo / Body | Cuerpo | Materia con landing | Diaria | 45 min | 15 | Foto/video |
| 3 | Higiene / Hygiene | Vida Práctica | Materia liviana | Diaria | 15 min | 5 | Check |
| 4 | Comunidad / Community | Comunidad y Mundo | Landing paraguas | Semanal | 45 min | 15 | Ver sub-bloques |
| 5 | Matemáticas / Math | Conocimiento | Materia con landing | Diaria | 45 min | 15 | Check + captura |
| 6 | Historia / History | Conocimiento | Materia con landing | 2-3x/sem | 45 min | 15 | Texto/mapa mental |
| 7 | Creatividad / Creativity | Creatividad | Landing paraguas | Diaria | 25 min | 10 | Ver sub-bloques |
| 8 | Negocios / Business | Conocimiento | Materia con landing | Semanal | 45 min | 15 | Planilla + foto |
| 9 | Cocina / Cooking | Vida Práctica | Materia con landing | Semanal | 60 min | 20 | Foto del plato |
| 10 | Pintura / Painting | Creatividad | Materia con landing | Semanal | 45 min | 15 | Foto de la obra |
| 11 | Entrenamiento canino / Dog training | Vida Práctica | Materia con landing | Diaria | 15 min | 10 | Video corto |
| 12 | Tai chi | Cuerpo | Materia con landing | 2-3x/sem | 25 min | 10 | Video corto |
| 13 | Computación / Computing | Conocimiento | Materia con landing | Diaria | 45 min | 15 | Check + captura |
| 14 | Public speaking | Comunicación | Materia con landing | Semanal | 25 min | 15 | Video |
| 15 | Lectura / Reading | Conocimiento | Materia con landing | Diaria | 25 min | 10 | Texto corto |
| 16 | Geografía / Geography | Conocimiento | Materia con landing | 2x/sem | 25 min | 10 | Mapa/quiz |
| 17 | Mecanografía y dictado | Comunicación | Habilidad transversal (sin landing) | Diaria | 15 min | 5 | Check + WPM automático |
| 18 | Meditar / Meditate | Mente | Hábito diario | Diaria | 10-15 min | 5 | Check |
| 19 | Descansar / Rest | Mente | Hábito diario | Diaria | — | 5 | Check |
| 20 | Análisis / journaling diario | Mente | Hábito diario | Diaria | 10 min | 5 | Texto corto |
| 21 | Research | Conocimiento | Hábito semanal | Semanal | 30 min | 10 | Texto/mini-ficha |
| 22 | Contactar al mundo | Comunidad y Mundo | Hábito semanal | Semanal | 20 min | 10 | Captura |
| 23 | Feedback al colegio | Vida Práctica | Ritual familiar semanal | Semanal | 15 min | 5 | Texto corto |
| 24 | Trabajo comunitario | Comunidad y Mundo | Hábito sem/mensual | Sem/mensual | 60 min | 20 | Foto |
| 25 | Limpiar el barrio | Comunidad y Mundo | Hábito mensual | Mensual | 45 min | 15 | Foto |
| 26 | Ayudar a alguien | Comunidad y Mundo | Hábito oportunista | Diaria | — | 5 | Texto corto |
| 27 | Tareas del hogar | Vida Práctica | Hábito diario | Diaria | 20-30 min | 10 | Check |
| 28 | Tiempo de arte | Creatividad | Hábito diario/sem | Diaria/3x | 25 min | 10 | Foto |
| 29 | Música | Creatividad | Hábito diario/sem | Diaria/3x | 25 min | 10 | Video/audio |
| 30 | Excursión mensual | Conocimiento + Comunidad | Evento mensual | Mensual | Medio día | 25 | Foto + texto |
| 31 | Viaje anual | Conocimiento + Comunidad | Evento anual | Anual | Varios días | 30 (tope) | Foto + diario de viaje |
| 32 | Escritura Creativa / Creative Writing | Creatividad | Materia con landing | Según ritmo propio (sugerido 2-3x/sem) | 30-45 min | 10-50 (variable por módulo) | Escribir un capítulo o ilustrar una escena de la historia propia | Texto tipeado/manuscrito + ilustración foto |

*Nota: Negocios, Computación y Public Speaking se ampliaron significativamente respecto a esta tabla base — ver el detalle completo en las secciones 7.7, 7.8 y 7.9.*

**Jerarquía visual en el heatmap:** vista **Día** = grilla principal con los ~14 bloques diarios fijos. Vista **Semana** = agrega los bloques semanales, "apagados" (no en rojo) los días que no corresponden. Vista **Mes** = calendario chico con la excursión mensual como celda-hito. Vista **Año** = línea de 12 meses donde el viaje anual es el gran evento del año, tratado como hito/insignia y no como celda de rutina.

**Prioridad de diseño curricular (Fase 4):** ya tienen diseño de contenido completo en este documento **Mente, Lectura, Geografía**. El resto de las materias (Cuerpo, Higiene, Matemáticas, Historia, Negocios, Cocina, Pintura, Entrenamiento canino, Tai chi, Computación, Public Speaking) usa la plantilla reutilizable de landing (sección 5.5) + la tabla-guía de la sección 7.4; se recomienda expandirlas de a 1-2 por semana una vez el motor de tareas esté funcionando.

---

## 5. UX: dashboard, panel de administración y mascota

### 5.0 Sistema de diseño (inspirado en Apple) — look & feel obligatorio para toda la plataforma

**Principio general:** la plataforma debe sentirse como una app premium de Apple (App Store, Fitness, Health, Freeform) — no como un tablero escolar ni una app "gamer" saturada de color. Limpieza, tipografía cuidada, mucho espacio en blanco, color usado con intención (como acento, no como fondo), transiciones suaves, materiales tipo vidrio esmerilado. La energía lúdica del heatmap y de la mascota Kai conviven con esta sobriedad — el color y la diversión viven en el contenido (categorías, insignias, mascota), no en el "chrome" de la interfaz (headers, paneles, navegación).

- **Tipografía:** `font-family: -apple-system, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif;` — en dispositivos Apple renderiza San Francisco de forma nativa; Inter como fallback de altísima calidad en Windows/Android (misma familia de proporciones, ampliamente usada como alternativa libre a SF). Jerarquía estricta de 5-6 tamaños (ej. 34/28/22/17/15/13pt), solo dos pesos por pantalla (Semibold para títulos, Regular para cuerpo), interlineado generoso (1.4-1.5) para que un chico de 11-12 lea cómodo.
- **Espaciado:** grilla de **8pt** (múltiplos de 8: 8/16/24/32/48/64px) para todo margen y padding — mismo criterio que Apple HIG, da consistencia inmediata.
- **Color:** paleta base neutra (blancos/grises cálidos tipo `#F5F5F7` en modo claro, `#1D1D1F` en modo oscuro) + los 7 colores de categoría (sección 4.1) usados como Apple usa el color en sus propios íconos de apps — saturados pero en superficies acotadas (íconos, barras de progreso, insignias), nunca como fondo de pantalla completo. **Modo claro y modo oscuro desde el día uno** (`prefers-color-scheme`), con los 7 colores de categoría recalibrados para mantener contraste y accesibilidad en ambos.
- **Superficies:** tarjetas con esquinas grandes y redondeadas (16-24px de radio, estilo iOS/macOS moderno), sombras muy sutiles (nunca sombras duras), y **paneles con vidrio esmerilado** (`backdrop-filter: blur()`) en elementos flotantes como el header o el modal del batch de foco — la misma sensación que el Centro de Control de iOS/macOS.
- **Movimiento:** transiciones tipo *spring* (resorte suave, nunca lineales ni bruscas) para cualquier cambio de estado, entre 200-400ms — abrir un módulo, marcar una tarea, cambiar de timeframe.
- **Iconografía:** set de línea fina y consistente, estilo SF Symbols (ej. Lucide o Phosphor en variante thin/light) — nunca mezclar sets de distinto estilo entre pantallas.
- **Base técnica:** shadcn/ui + Tailwind (sección 8), pero con un tema propio que reemplace radios/sombras/tipografía/paleta por defecto según este sistema — nunca dejar el look "shadcn genérico" sin personalizar.
- **Prueba de calidad:** cada pantalla debe poder pasar el filtro de "¿esto podría ser una app destacada en el App Store?" — si algo se ve genérico, corporativo-escolar o saturado de color sin criterio, no está a la altura del estándar pedido.

### 5.1 Dashboard principal

- **Header fijo:** avatar + saludo corto de la mascota (abre el mensaje diario completo al tocar) a la izquierda; racha (🔥 días) y puntaje total como chips chicos al centro; mini-avatar de mascota + notificaciones a la derecha. **No hay barra de tabs ancha: el dashboard es la navegación principal.**
- **Selector de timeframe:** segmented control **Día | Semana | Mes | Año**, debajo del header. Día es la vista por defecto.
- **La grilla (heatmap):** cada celda = un bloque de tiempo asociado a una tarea. Color base = categoría madre. **El estado nunca depende solo del color** — símbolo superpuesto: ✓ hecho, ○ pendiente, ⚠ atrasado, pulso sutil en la tarea sugerida "para ahora". Intensidad de color como matiz secundario (más oscuro = más puntos/prioridad).
- **Widget de celda (hover/tap):** nombre + categoría, última actividad hecha o próxima sugerida, símbolo de estado, puntos en juego, botón único ("Empezar batch de foco" o "Ver detalle" si ya está hecho).
- **Batch de foco:** modal de pantalla completa con temporizador circular tipo pomodoro (15/25/40 min), mascota acompañando, pantalla oscurecida sin notificaciones durante la sesión. Al terminar: confirmación + adjuntar evidencia si corresponde → vuelve al mapa con la celda actualizada.
- **Ranking:** ícono chico y discreto en una esquina — **nunca tab principal ni parte del flujo diario**.
- **Buzón de sugerencias:** ícono tipo sobre cerca de la mascota; una sola pregunta abierta (texto o nota de voz corta) que llega directo al panel admin.

### 5.2 Mensaje diario del mentor

Se dispara **en el primer login del día** (no a hora fija). Estructura fija en 4 partes: **(1)** saludo personalizado con referencia a algo reciente, **(2)** resumen breve del día anterior, **(3)** 2-3 prioridades sugeridas de hoy (no la lista completa), **(4)** frase motivacional/cita del banco rotativo (sección 14.3).

Ejemplos de tono (adaptar nombre real del alumno):

> "Buen día. Ayer cerraste 3 de 3 tareas y tu racha va por 6 días — nada mal. Hoy: lectura, entrenamiento y geografía (ríos). Si arrancás por lo que menos ganas te da, después todo pesa menos. *'No es que tengamos poco tiempo, sino que perdemos mucho.'* — Séneca."

> "Hola. Ayer costó, quedaron 2 tareas pendientes y no pasa nada — se recuperan hoy sin drama. Arrancá por lo más corto para agarrar impulso. *'El coraje no es no tener miedo, es actuar a pesar del miedo.'*"

### 5.3 Panel de administración (padres)

7 secciones: **Categorías/materias** (crear/renombrar/archivar/reordenar), **Tareas y plantillas** (recurrencia, puntos, duración de batch, asignación por hijo), **Catálogo de libros** (título, autor, portada, estado), **Reglas de puntos** (rangos por tipo de actividad, umbrales de niveles, con vista previa), **Revisión de evidencias** (ver foto/texto, puntaje IA editable en un toque + comentario opcional), **Progreso por hijo** (gráficos simples: barras semanales, racha, distribución por categoría), **Mascota y mensajes** (tono de citas, activar/desactivar categorías, previsualizar mensaje diario).

### 5.4 Personaje mentor: **Kai**

Zorro-guía de expedición con morral de viajero, mitad animal mitad criatura de mapa antiguo con detalles de brújula en el pelaje. **Personalidad:** curioso, calmo, filósofo sin ser solemne; pregunta más que ordena ("¿Por dónde querés arrancar hoy?"); nunca regaña, reencuadra los días flojos. **Rol:** guía de expedición, no autoridad — conecta cada logro con las 4 "brújulas estoicas" (sabiduría, coraje, templanza, justicia). **Estilo visual:** flat design moderno, paleta cálida y terrosa (naranja quemado, verde bosque, azul brújula, crema), ni infantil de bebé ni corporativo. **4 estados de ánimo:** celebrando (confeti, brújula brillando), animando tras un bajón, neutral/guía (saludo diario), concentrado/acompañando (durante el batch de foco).

*Nota: "Kai" es una propuesta de partida — confirmar nombre/diseño final con la familia antes de producción; se puede refinar con un ilustrador o generación de imágenes.*

### 5.5 Landing page tipo (plantilla reutilizable para toda materia)

**(1)** Portada del módulo actual con barra de progreso; **(2)** línea de módulos/niveles tipo "camino de expedición" (completados / actual resaltado / próximos atenuados); **(3)** actividad de hoy destacada, con acceso directo al batch de foco; **(4)** historial de entregas (miniatura + puntaje); **(5)** tabla de puntos evolutivos de esa materia.

### 5.6 Principios de diseño visual

1. Vibrante pero no saturado — estética premium tipo Apple (sección 5.0), el color se usa como acento con criterio, nunca como fondo saturado.
2. **Tablet/desktop-first:** se usa desde tablet y ordenador, no desde celular — layouts pensados para pantallas medianas/grandes, con soporte real de mouse+teclado (hover, atajos en el admin) y de touch (tablet).
3. Feedback inmediato: micro-confetti, sonido sutil, animación al completar tarea/batch.
4. Accesibilidad de color: el heatmap nunca depende solo del color (símbolos superpuestos), paleta validada contra daltonismo.
5. Jerarquía clara: lo crítico (qué hacer hoy) a un toque; lo secundario (ranking, historial, config) un nivel más adentro.
6. Un mundo coherente — mascota, íconos y rangos refuerzan la metáfora de expedición/viaje personal, no de "deberes con otro nombre".

---

## 6. Sistema de gamificación y puntaje

### 6.1 Filosofía

Los puntos son la "calificación", pero funcionan como **medidor de esfuerzo y constancia**, no como juicio de valor. Comparación contra uno mismo, nunca entre hermanos. Ningún puntaje ya ganado baja. Toda pérdida de puntos por atraso tiene ventana de gracia y recuperación. Transparencia total: el alumno siempre puede ver por qué tiene los puntos que tiene.

### 6.2 Economía de puntos

| Tipo de actividad | Rango de puntos | Ejemplo |
|---|---|---|
| Hábito simple/diario | 5–10 pts | Meditar, hacer la cama, leer 20 min |
| Actividad de landing con evidencia | 10–25 pts | Resumen de lectura, entrenamiento, receta |
| Presentación/proyecto grande | 20–40 pts | Exposición oral, proyecto de ciencias |

**Puntaje semanal** (lunes-domingo, se resetea visualmente, queda archivado) vs. **puntaje acumulado histórico** (nunca baja, define el nivel).

### 6.3 Niveles ("Rangos de Explorador")

| Rango | Puntos acumulados | Insignia |
|---|---|---|
| Semilla | 0–199 | 🌱 |
| Aprendiz de Ruta | 200–499 | 🧭 |
| Explorador | 500–999 | 🗺️ |
| Trotamundos | 1000–1799 | 🎒 |
| Guía de Expedición | 1800–2799 | 🔥 |
| Maestro de Vida | 2800–4000 | ⭐ |
| Leyenda de la Escuela | 4000+ | 🏔️ |

### 6.4 Tareas pendientes/vencidas

| Estado | Puntos |
|---|---|
| Completada a tiempo | 100% del valor |
| Completada tarde (dentro de gracia de **72 horas**) | 80% del valor (−20%) |
| No completada nunca (pasadas las 72h) | 0 pts ganados — **nunca resta, nunca genera deuda** |

### 6.5 Rachas y bonificaciones

Bonus de racha: 3 días = +5 pts, 7 días = +15 pts, 30 días = +50 pts + insignia especial. **1 "freeze" disponible por semana** (no acumulable): si se salta un día, la racha no se rompe pero tampoco suma puntos ese día; si se saltan 2 días seguidos sin freeze, la racha se reinicia (sin penalizar los puntos ya ganados).

### 6.6 Ranking ficticio

8 "alumnos" ficticios con nombres neutros (ej. Vale, Nico, Sasha, Mati, Cande, Toti, Uma, y uno más) y arquetipos de desempeño distintos (constante moderado, sprinter, recién llegado, **"casi-en-la-cima"** —su puntaje se recalcula como promedio del alumno real + 5–15%, para que siempre haya alguien alcanzable arriba—, irregular). Modelo de datos con `is_fictional: boolean` para reemplazo futuro por alumnos reales cuando escale a otras familias, sin tocar la lógica del ranking. Botón discreto, nunca central.

### 6.7 Insignias (20 propuestas — ver detalle ampliable en sección 14.4)

Repartidas en las 7 categorías madre + transversales: *Mente en Calma, Guerrero del Sueño, Energía Total, Devorador de Libros, Científico en Acción, Artista en Ascenso, Chef de la Casa, Manos a la Obra, Orador Nato, Bilingüe en Marcha, Hermano Solidario, Voz de la Familia, Racha de Hierro, Maestro de la Constancia, Explorador Completo, Segunda Oportunidad, Nivel Superado, Proyecto del Mes, Cuerpo y Mente, Espíritu de Equipo.*

---

## 7. Currículo por materia

### 7.1 Mente / Desarrollo personal

> Inspirado en Brian Tracy, Jim Rohn, Tony Robbins, Dr. Joe Dispenza (meditación/visualización, enmarcado como práctica y NUNCA como ciencia comprobada) y Marco Aurelio/estoicos.

**10 módulos progresivos** (sin fechas, por dominio):

1. **La rana del día** (Tracy) — hacer primero lo que más cuesta. *Registro diario 5 días → 10 pts + 5 bonus.*
2. **Metas que se pueden tocar** (SMART simplificado) — 3 metas con plantilla Qué/Cómo lo mido/Para cuándo. *15 pts.*
3. **La ley de la siembra** (Rohn) — elegir 1 hábito chico y sostenerlo 7 días. *15 pts.*
4. **Sos el promedio de tus 5 amigos** (Rohn adaptado) — reflexión sobre influencias, sin exponer a terceros negativamente. *10 pts.*
5. **El estado manda** (Robbins simplificado) — video "antes/después" de activar el propio ánimo. *15 pts.*
6. **El termómetro interno** — registrar ánimo/energía 1-10, dos veces al día, 5 días. *10 pts.*
7. **Respirar y observar** (mindfulness) — 5 min de respiración guiada, 3x/semana + reflexión. *15 pts.*
8. **La película mental** (visualización) — imaginar en detalle un desempeño exitoso antes de un evento real. *15 pts.*
9. **Lo que depende de mí** (dicotomía del control, Marco Aurelio) — tabla de 2 columnas sobre una situación real reciente. *15 pts.*
10. **Las 4 brújulas** (virtudes estoicas: sabiduría, coraje, templanza, justicia) — módulo integrador de cierre. *20 pts.*

**Hábito diario "3 líneas estoicas"** (encaja con bloque "meditar"): 3 prompts rotativos (*"Hoy lo que más pude controlar fue..."*, *"Algo que me costó y cómo reaccioné..."*, *"Una cosa buena que hice o agradezco hoy..."*), máx. 3 líneas, escrito o fotografiado. 5 pts/entrada, tope semanal 30 pts, bonus de racha cada 5 días.

**Rúbrica de evaluación IA (0-5 cada una):** profundidad de la reflexión, conexión con el concepto enseñado, evidencia de pensamiento propio, progreso de caligrafía (solo si aplica). Reglas: priorizar esfuerzo/honestidad sobre "corrección"; nunca 0 por una reflexión breve pero genuina; feedback siempre cálido; foto ilegible → pedir reintento amable, sin penalizar.

**Advertencias de tono obligatorias:** sin política partidista; nada de pseudociencia presentada como hecho (especialmente Dispenza: se enmarca como "ejercicio de meditación/visualización", nunca "cambia tu ADN" ni "física cuántica" como verdad); espíritu práctico, no motivacional vacío; vocabulario y ejemplos de un chico de 11-12; feedback IA nunca compara entre hermanos; puntos = incentivo lúdico, nunca calificación de valor personal.

*(Banco completo de 20 citas rotativas en sección 14.3.)*

### 7.2 Lectura y pensamiento crítico

**Estructura de datos del catálogo:** `titulo, autor, idioma, edad_recomendada, categorias (array — un libro puede pertenecer a más de una), nivel_dificultad, puntos_base, sinopsis_corta, estado (por alumno vía tabla intermedia libro_alumno), habilitado_por, fecha_habilitacion, portada_url, preguntas_sugeridas, paginas_aprox, activo`. El catálogo es **curado exclusivamente por los padres** desde el admin. Categorías disponibles: `desarrollo_personal, historia, ciencia, aventura, estoicismo_filosofia, biografia, naturaleza, ficcion_clasica, formacion_caracter`.

**Categoría "Formación del carácter":** inspirada en el tipo de lecturas que tradicionalmente se usaban para transmitir valores a hijos destinados a liderar (exploradores, biografías de líderes históricos no controversiales, fábulas y clásicos morales). El disparador fue la historia real del capitán **Ernest Shackleton**, cuya expedición *Endurance* (1914-1917) quedó atrapada en el hielo antártico y logró traer con vida a los 27 tripulantes gracias a su liderazgo bajo presión. Libro recomendado: ***Shackleton's Journey*** de William Grill (Flying Eye Books) — en inglés, muy visual, sin contenido gráfico, foco en trabajo en equipo y toma de decisiones. La categoría es transversal por diseño: un libro puede estar en `formacion_caracter` y en su categoría original a la vez (ej. *Hatchet* sigue siendo aventura y también formación del carácter). **16 títulos nuevos** + una "Ruta de lectura de valores" opcional en el Anexo 14.1-bis.

**Flujo de presentación:** elegir libro → leer (progreso opcional por capítulos) → al finalizar, sistema sugiere 2-3 preguntas de pensamiento crítico según categoría → alumno elige formato (reseña manuscrita fotografiada / video 2-3 min / mapa mental / combinación) → sube evidencia → IA evalúa con rúbrica → feedback + puntaje → libro pasa a "leído" → se actualiza la bitácora.

**Rúbrica (0-25 pts cada criterio, máx. 100):** comprensión, pensamiento crítico/opinión propia, esfuerzo/prolijidad, caligrafía (solo si la entrega es manuscrita — si no, se redistribuyen o normalizan sobre 75).

**Evaluación de caligrafía con IA de visión — reglas obligatorias:**
- Comparar siempre contra las **últimas 3-5 muestras del mismo alumno**, nunca contra el hermano ni un estándar adulto.
- Señales: legibilidad, consistencia de tamaño, alineación, espaciado, prolijidad general (tachones, presión, uso del renglón).
- Feedback: **siempre 1 cosa positiva + 1 cosa a mejorar**, tono cálido; si hay mejora respecto a muestras previas, nombrarla explícitamente; cerrar con una sola sugerencia accionable.
- Ejemplo de salida esperada: *"Me gustó mucho que esta vez respetaste bien el renglón en casi todo el texto. Para la próxima, probemos que las letras mantengan un tamaño más parejo hacia el final de la página. ¡Se nota que le pusiste tiempo a esto!"*

**Bitácora de estudio (PDF):** portada, línea de tiempo de libros leídos, ficha por libro (puntaje + desglose), fragmentos de reseñas destacadas, galería de trabajos, curva de progreso de caligrafía, resumen de insignias/puntos, nota final personalizable por los padres.

**Catálogo semilla y banco de preguntas:** ver Anexo 14.1 y 14.2.

### 7.3 Geografía y geopolítica

**Regla de tono obligatoria (aplica a todo el contenido de nivel 5-6):** definir, no juzgar; prohibido lenguaje valorativo ("superior/inferior", "es injusto"); clasificar países solo según fuentes reconocidas (FMI, Banco Mundial, CIA World Factbook, ONU), citando fuente y año; conflictos actuales presentados con estructura fija (actores / qué disputan / desde cuándo / qué dicen fuentes neutrales) sin tomar partido; **revisión humana obligatoria** de todo contenido de nivel 5-6 antes de publicar, y revisión periódica (anual/semestral) porque esta información cambia.

**6 niveles progresivos:** (1) continentes y océanos → (2) países y capitales por continente → (3) ríos y cordilleras principales → (4) banderas → (5) sistemas económicos y de gobierno simplificados, con fuente citada → (6) geopolítica básica (ONU, UE, OTAN, bloques económicos, mapa de conflictos actuales explicado neutralmente).

**Mecánicas de minijuego:** mapa mudo interactivo (arrastrar país/bandera a su ubicación), quiz cronometrado de banderas, conectar río/montaña con país-continente, ficha de país modo "detective" (adivinar con pistas parciales), examen sorpresa aleatorio (puntaje x1.5), streak diario "Vuelta al mundo" (5 preguntas rápidas tipo Duolingo), mapa de organizaciones internacionales (nivel 6). Todas con versión bilingüe ES/EN.

**Puntos:** 20-80 por partida suelta, 150-300 por nivel superado, +10 a +25 cada 7 días de racha, +20 por dominio completo de un sub-mazo.

**Esquema de datos:** entidades `Pais` (con `sistema_economico_fuente_y_año` y `ultima_revision_admin`), `Rio`, `Montaña/Cordillera`, `OrganizacionInternacional`. Ejemplo de 6 países con datos completos en el Anexo 14.5.

**Fuentes recomendadas para mantener actualizado:** CIA World Factbook, Banco Mundial, FMI, ONU (incluyendo su Cartographic Section para mapas neutrales), Britannica.

### 7.4 Mecanografía y dictado (habilidad transversal, sin landing propia)

Pensada específicamente para que un chico con vocación de escritor pueda ganar velocidad de tipeo sin depender de escribir a mano. Mecánica: el alumno elige un tema/texto (de una lista curada por los padres o generado por IA sobre un tema que el chico elija), se le toma el tiempo de principio a fin, y el sistema mide **palabras por minuto (WPM)** y **precisión** en tiempo real, con descuento de puntos por faltas de ortografía.

- **Modalidad "dictado libre":** el chico elige tema → sistema muestra/lee el texto → cronómetro en marcha → al terminar, se resaltan errores ortográficos y se calcula WPM y % de precisión.
- **Progreso histórico:** gráfico de WPM y precisión a lo largo del tiempo (igual criterio que la caligrafía: contra el propio historial).
- **Puntos:** 5 pts base por sesión + bonus por WPM/precisión sobre el propio promedio reciente.
- **Integración cruzada:** puede ofrecerse como alternativa de tipeo en vez de escritura a mano para reseñas de Lectura o el journal de Mente, sumando puntos de mecanografía a la vez.
- **Evidencia:** automática (texto tipeado + métricas), sin necesidad de foto/video.

### 7.5 Escritura creativa y storytelling

> Nace de un pedido puntual: guiar a la hija, con fuerte vocación de escritora, hasta terminar y publicar su primera historia larga e ilustrada. Diseñado para que cualquier alumno lo use con cualquier género.

**Ubicación:** landing propia dentro de la categoría madre **Creatividad** (mismo patrón que Pintura), distinta de "tiempo de arte libre" porque tiene progresión curricular real con prerrequisitos, igual que Lectura o Mente.

**12 módulos en 3 etapas** (desbloqueo secuencial, sin fecha límite):

*Etapa 1 — Cimientos (el viaje del héroe):* **(1) El mapa de todas las historias** — el viaje del héroe de Campbell explicado con Star Wars/Harry Potter/Percy Jackson como puente (15 pts). **(2) Tu chispa de idea** — 3 ideas "¿qué pasaría si...?" y elegir una (10 pts). **(3) Tu mundo ordinario y tu llamado** — primera entrada de la Biblia de la historia (15 pts).

*Etapa 2 — Herramientas de estructura:* **(4) Ficha de personaje** — deseo, miedo, defecto, arco de transformación (15 pts). **(5) Tu historia en 3 actos** (20 pts). **(6) El corazón del conflicto** — obstáculo externo + duda interna (15 pts). **(7) Mostrá, no cuentes** — reescribir oraciones "contadas" en "mostradas" (15 pts). **(8) La escaleta de escenas** — índice de capítulos cubriendo las 8 etapas del héroe (20 pts).

*Etapa 3 — Borrador, edición e ilustración:* **(9) Capítulo a capítulo** — meta propia de palabras por capítulo, se repite tantas veces como capítulos (15-20 pts c/u). **(10) Leer en voz alta y pulir** — checklist de coherencia + 2 correcciones (15 pts). **(11) Ilustrá tu historia** — portada + 3-5 escenas clave, a mano o digital (20 pts). **(12) Publicá tu libro** — cierre: PDF automático con portada, capítulos e ilustraciones (40-50 pts + insignia especial **"Autor Publicado" 📖✒️**).

**La Biblia de la historia:** página fija (no una tarea más) que se autocompleta módulo a módulo — protagonista, mundo, personajes secundarios, línea de tiempo del viaje del héroe, lista de capítulos con estado (planificado/borrador/final/ilustrado). Tabla `story_bible` (ver sección 10).

**Rúbrica IA de capítulos (0-25 c/u):** coherencia narrativa, desarrollo de personaje, uso de técnicas enseñadas (nunca gramática/ortografía pura), esfuerzo y extensión (¿se acercó a su propia meta de palabras?). Regla clave: **terminar la historia pesa más que la perfección técnica** — un capítulo con errores que avanza la trama nunca puntúa peor que uno "prolijo" que no avanza nada.

**Ilustración (módulo 11):** feedback IA centrado en si la escena **se entiende** (quién es el personaje, qué pasa, dónde), nunca en técnica de dibujo formal (nada de perspectiva/sombreado/anatomía) — comparación siempre contra el propio historial, nunca contra un estándar adulto.

**"Publicá tu libro" (módulo 12):** reutiliza la misma lógica de PDF ya definida para la bitácora de Lectura — portada, índice, capítulos completos con ilustraciones insertadas, página de cierre con ficha del autor y resumen de puntos/insignias.

### 7.6 Matemáticas como desafío

Formato fijo en **3 pasos** para cada tema (fracciones, proporciones, lógica, geometría básica, etc.), en vez de una lista de ejercicios sueltos:

1. **Explicación IA súper simple:** antes de cualquier ejercicio, una explicación breve (3-5 líneas, generada/curada con Claude) del concepto usando lenguaje y ejemplos de la vida de un chico de 11-12 (repartir una pizza, la plata del kiosco, medir un ambiente) — **cero jerga**, cero fórmulas sin contexto primero.
2. **Ejemplo resuelto paso a paso:** un problema resuelto completo, mostrando cada paso con una frase corta de "por qué" (no solo el cálculo), para que el chico vea el razonamiento antes de intentarlo solo.
3. **Desafío a resolver:** 1 problema (o 2-3 variantes del mismo nivel) que el chico resuelve solo, enmarcado como reto/juego ("¿podés descifrar esto?") y no como "tarea de matemática". Corrección con feedback inmediato: si se equivoca, la IA no da la respuesta directamente — reformula una pista más simple y deja reintentar.

**Evidencia:** check de completado + captura del ejercicio resuelto (o resultado ingresado en la app). **Puntos:** 10-15 pts por desafío resuelto solo; +5 si lo resolvió sin necesitar pistas. **Fuente de contenido:** Khan Academy u otra plataforma curada como banco de ejercicios de base, más el envoltorio de "explicación simple + desafío" construido en la propia plataforma.

### 7.7 Negocios y finanzas (emprendimiento + laboratorio de mercados + comunidad online)

Negocios pasa a tener **tres frentes**, todos con el mismo principio rector: aprendizaje real, **cero dinero real, cero cuentas propias en plataformas que exigen mayoría de edad o 13+**.

**A) Emprendimiento (base ya definida):** mini-proyecto real (puesto de venta, venta online) con seguimiento de números — planilla + foto como evidencia.

**B) Laboratorio de Mercados (trading simulado):**

*Qué es técnicamente posible hoy con TradingView (investigado en agosto 2026) — para no prometer algo irreal:*

| Pregunta | Respuesta |
|---|---|
| ¿Puede un menor abrir su propia cuenta? | **No.** El ToS exige mayoría de edad; la cuenta debe quedar a nombre legal del padre, con los hijos operando bajo supervisión. |
| ¿Existe modo Paper Trading (saldo ficticio, sin dinero real)? | **Sí**, nativo, incluso en el plan gratuito. |
| ¿Existe API para leer automáticamente saldo/P&L de la cuenta paper? | **No existe.** Solo hay una "Broker REST API" para casas de bolsa licenciadas, no para uso retail. |
| ¿Sirven los webhooks de alertas para sincronizar ganancias? | **No.** Se disparan por precio/indicador en un gráfico, no por P&L — solo son útiles para el módulo de reconocimiento de patrones. |
| Conclusión práctica | El P&L → puntos se resuelve con **reporte manual asistido** (captura semanal validada por un adulto), no con sincronización automática. |

- **Marco de seguridad:** se presenta como "Laboratorio de Mercados", nunca como forma de ganar dinero; prohibido cualquier lenguaje de "ganar plata" — se habla de "puntos de simulación". Abrir una cuenta real con dinero real queda **fuera del alcance de este proyecto**, como decisión financiera/legal exclusiva de los padres.
- **8 módulos de alfabetización de mercado:** qué es una acción → oferta y demanda → leer velas japonesas (básico) → tendencias → soportes y resistencias → diversificación → riesgo vs. tiempo → bitácora semanal de reflexión (este último se repite cada semana).
- **Conversión de ganancia simulada en puntos:** `puntos = min(max(0, variación_semanal %) × 10, TOPE_SEMANAL)`, con `TOPE_SEMANAL = 50` (o `100` con 3+ posiciones distintas abiertas, para premiar diversificar en vez de concentrar). Una semana en rojo da **0 puntos, nunca negativos**. +5 pts fijos por completar la bitácora, gane o pierda.
- **Integración técnica real:** Vía principal = reporte manual (captura semanal del panel Paper Trading, validada por un padre antes de acreditar puntos). Vía secundaria opcional = webhook de alerta de patrón (ej. "precio cruza resistencia X") hacia un endpoint propio, que otorga una insignia de "patrón detectado en vivo" — sin relación con puntos de ganancia.

**C) Comunidad online y creación de contenido:**

- **Por qué es delicado:** la mayoría de redes/plataformas (Instagram, TikTok, YouTube estándar) exigen 13+ en sus ToS (marcos como COPPA). Con 11 y 12 años, se arranca en un espacio propio, no en plataformas públicas.
- **Progresión (8 etapas):** elegir nicho/tema propio → plan de contenido de 4 semanas → crear pieza 1 (texto) → crear pieza 2 (imagen/video) → publicar con constancia 4 semanas seguidas → medir reacciones → iterar según lo aprendido → *(opcional a futuro)* plan de salida a plataforma pública real, administrada por el padre.
- **Dónde publican hoy:** un **mini-blog/feed privado dentro de la propia plataforma**, visible solo para la familia — sin restricción de edad porque no es una red social externa. Blog propio con dominio o YouTube/Instagram quedan documentados como camino futuro posible, activables solo con decisión explícita de los padres y cuenta administrada por un adulto (si se habilita YouTube real, la **YouTube Data API v3** con OAuth del padre permite leer vistas/likes del canal).
- **Puntos por mejora sostenida, no por viralidad puntual:** `puntos_semana = piezas_publicadas × 8 + bonus_constancia (10 pts/semana consecutiva, hasta 4) + bonus_mejora (15 pts si el promedio del mes supera al anterior, con mínimo 3 piezas)`, con `TOPE_SEMANAL = 60` para que una reacción inusualmente alta de un familiar no dispare puntos desproporcionados.

### 7.8 Computación: tracks personalizables (Scratch / Shapr3D)

Computación deja de ser una sola landing genérica y pasa a tener **tracks asignables por hijo** — primer caso concreto de la idea general de la plataforma de personalizar el currículo según el interés de cada chico.

**Modelo de datos:** `track` es una entidad ligada a la categoría (no una sub-categoría ni una landing separada), para no multiplicar el heatmap ni duplicar la lógica de puntos/streaks ya existente. Nuevas tablas `tracks` y `student_tracks` (detalle en sección 10); `task_templates.track_id` nullable (una tarea sin track es visible en cualquiera). El padre asigna el/los track(s) de cada hijo desde el admin; Computación sigue siendo una sola celda del heatmap, un solo color, un solo pool de puntos.

**Track A — Programación (Scratch → Python), 10 desafíos crecientes:** de una secuencia simple (mover un personaje, evidencia: captura + `.sb3`, 15 pts) pasando por loops, condicionales y variables (quiz interactivo, contador de puntos, 20-25 pts), hasta un juego con niveles de dificultad creciente y un proyecto libre tipo Pong/laberinto (35-40 pts), con un desafío bonus de puente a Python. **Evaluación IA:** el backend abre el `.sb3` (es un zip) y extrae `project.json`, que lista los bloques/opcodes usados de forma casi determinística — Claude confirma si cumple la consigna funcional, si usó las estructuras pedidas, y da 1 comentario constructivo.

**Track B — Modelado 3D con Shapr3D, 10 desafíos crecientes:** Shapr3D exporta STEP/IGES (sólido paramétrico) y STL/OBJ (mallado) — **no exporta GLB nativo**, por lo que la plataforma convierte STL→GLB en el backend para visualizarlo. De pieza con medida exacta (nivel 1, 15 pts) y agujero pasante centrado, pasando por un soporte funcional y un objeto de 2 piezas que encajan (20-25 pts), hasta un engranaje con partes móviles, una pieza de un juego de mesa propio, y un diseño funcional propio a elección con su propia consigna y medidas (35-40 pts) — con un bonus opcional de imprimirlo en 3D si hay impresora disponible. **Publicación:** el alumno sube STL (+STEP opcional) y capturas; el visor embebido recomendado es **`<model-viewer>` de Google** (liviano, soporta GLB/GLTF, gestos táctiles nativos). **Rúbrica IA (0-25 c/u):** precisión de medidas (chequeo **programático** del bounding box del STL contra la consigna, no solo visual), complejidad/dificultad alcanzada, calidad de diseño/resolución del problema, prolijidad del modelado (mallas limpias) — evaluado por Claude con visión sobre el render, siempre con override del padre disponible.

Ambos tracks usan el mismo rango de puntos ya definido (15-40 pts) sin crear una economía paralela, y suman badges nuevas ("Diseñador en Ascenso", "Programador en Ascenso") siguiendo el patrón ya existente.

### 7.9 Public speaking integrado ("sin que se den cuenta")

Se abandona la idea de una landing aislada de "Public Speaking": la habilidad se **inyecta de forma orgánica** al cerrar actividades de otras materias — terminar un libro en Lectura, cerrar un módulo de Mente, resolver un desafío difícil de Matemáticas, cerrar un proyecto de Historia/Ciencias — pidiendo, como cierre natural, un video corto contando lo que hizo. El marco mental es "estoy mostrando lo que aprendí", no "estoy practicando oratoria".

- **Frecuencia:** 2-3 videos por semana, nunca más de uno el mismo día; el sistema prioriza la materia que menos disparó video en las últimas 2 semanas para que no se sienta repetitivo. Invitación **opcional-con-incentivo**, nunca un bloqueo de la actividad principal.
- **Consigna y tiempo objetivo:** siempre concreta y ligada a lo recién hecho ("explicá qué era la fotosíntesis, como si se lo contaras a alguien que no sabe nada"). Ventana sugerida 60-90s (11 años) / 90-120s (12 años), con margen ±15s — nunca se bloquea el guardado por tiempo, solo se sugiere ajustar. Grabación con la cámara del propio dispositivo (tablet/ordenador), sin estudio ni edición, tantos intentos como quiera antes de subir.
- **Progresión anual:** trimestre 1 sin exigencia de estructura ("contame algo que aprendiste hoy") → trimestre 2 con estructura simple y justificación → trimestre 3 con introducción + 2 puntos clave + cierre, ventana 2-3 min. El avance no es un botón visible para el chico — lo ajusta el sistema según el calendario escolar.
- **Privacidad y almacenamiento (núcleo del pedido, no negociable):** bucket de storage **privado por diseño**, nunca público; cada video se sirve solo mediante **URLs firmadas de corta duración**, nunca links permanentes. Autorización verificada en el backend (no solo frontend) por `familia_id` + `alumno_id` — ninguna otra familia ni alumno puede acceder, no existe "feed" ni "explorar". **Pantalla explícita de consentimiento parental** antes de habilitar la cámara del primer alumno (qué se graba, dónde, quién accede, cómo desactivar/borrar). **Retención:** calidad completa 90 días, luego se resume a transcripción + thumbnail (el video pesado se comprime/elimina salvo que el padre marque "conservar siempre"). Nunca se hacen públicos ni se comparten fuera del núcleo familiar sin autorización explícita y puntual por video.
- **Evaluación IA sin analizar video crudo:** se transcribe el audio (Whisper) y el modelo de lenguaje evalúa **sobre el texto** (estructura inicio-desarrollo-cierre, claridad de la idea principal); tono/ritmo se derivan de métricas simples del audio (duración, pausas). **Explícitamente fuera de alcance: reconocimiento facial, análisis de expresión corporal o biometría facial sobre menores.**

### 7.10 Resto de materias (usar plantilla de landing de la sección 5.5 + esta guía)

| Materia | Objetivo | Fuente de contenido sugerida | Evidencia |
|---|---|---|---|
| Cuerpo | Fuerza, resistencia, hábito diario de movimiento | Rutinas por edad + deporte que ya practiquen | Foto/video |
| Higiene | Autonomía en cuidado personal y del espacio propio | Checklist definido por los padres | Check |
| Historia | Contexto de civilizaciones ligadas al viaje anual + hitos universales | Currículo enlazado al destino del año (Egipto/Roma/Grecia) + documentales curados | Texto/mapa mental |
| Creatividad (paraguas, arte libre) | Expresión libre, sin evaluar "talento" (distinto de Escritura Creativa y Pintura, que sí tienen currículo propio) | Prompts creativos rotativos | Foto/registro |
| Cocina | Autonomía culinaria y hábitos saludables | Recetario curado por los padres, dificultad creciente | Foto del plato |
| Pintura | Técnica progresiva (color, perspectiva, materiales) | Ejercicios guiados tipo curso curado | Foto de la obra |
| Entrenamiento canino | Responsabilidad y vínculo con la mascota familiar | Guía de comandos progresivos, refuerzo positivo | Video corto |
| Tai chi | Calma corporal y coordinación, complemento de Mente | Secuencia guiada en video curada | Video corto |

---

## 8. Arquitectura técnica y stack

**Prioridad explícita del proyecto:** simple, gratis/bajo costo para arrancar (2 alumnos + 2 padres), fácil de mantener, y que escale rápido cuando haga falta (multi-familia, multi-tenant, posible SaaS educativo a futuro).

### 8.1 Stack recomendado

| Capa | Elección | Por qué |
|---|---|---|
| Framework full-stack | **Next.js 14+ (TypeScript, App Router)** | Frontend + backend en un repo; ecosistema muy conocido por Claude Code → código más confiable generado más rápido |
| UI | **Tailwind CSS + shadcn/ui** | Componentes copiables, fácil de tematizar (heatmap, mascota, badges) |
| Base de datos | **Supabase (Postgres administrado)** | Postgres real desde el día uno, free tier generoso, RLS nativo para multi-tenant, tipado autogenerado hacia TS |
| Auth | **Supabase Auth** — magic link para alumnos, email+password para admin | Evita que menores manejen contraseñas; roles vía tabla `users` |
| Storage | **Supabase Storage** | Buckets con RLS igual al resto del modelo (fotos, videos) |
| Hosting | **Vercel (Hobby/Free)** | Deploy automático desde GitHub, preview por PR, cero config de servidores |
| IA / evaluación | **Anthropic Claude API** (modelo con visión) | Un solo proveedor para evaluar caligrafía, lectura, transcripciones de public speaking y generar mensajes del mentor |
| Transcripción de video | **Whisper (API)** antes de pasar el texto a Claude | Claude evalúa mejor texto que video crudo; abarata y estandariza |
| Generación de PDF | **`@react-pdf/renderer`** | Bitácora como componentes React, corre en server |
| Emails/notificaciones | **Resend** (+ React Email) | Free tier (~3.000 emails/mes) |
| Jobs programados | **Vercel Cron** (triggers) + **pg_cron/Supabase Edge Functions** (lógica pesada: streaks, penalizaciones) | Bajo costo, corre cerca de los datos |
| CI/CD | **GitHub + Vercel** | Push a `main` = deploy automático; PRs = preview URL |
| Pagos (futuro) | **Stripe** | Se agrega recién al abrir a otras familias — no entra en el MVP |
| Visor 3D (track Shapr3D) | **`<model-viewer>` de Google** | Web component liviano con soporte nativo de GLB/GLTF y gestos táctiles; alternativa si hace falta más control (medir, cortar) sería Three.js + `STLLoader` |
| Conversión de mallas 3D | **`trimesh`/`numpy-stl` (Python) o `gltf-pipeline`** server-side | Shapr3D no exporta GLB nativo — hay que convertir STL/OBJ subido por el alumno a GLB en el backend antes de mostrarlo en el visor |
| Storage de video privado (Public Speaking) | **Supabase Storage con bucket privado + URLs firmadas de corta duración** | Nunca un bucket público; autorización verificada en el backend por `family_id`/`student_id`, nunca solo en el cliente |
| Integraciones externas opcionales (futuro) | **TradingView (sin API de lectura propia, solo webhooks de alerta) / YouTube Data API v3 (OAuth del padre)** | Ver detalle honesto de qué es posible hoy en la sección 7.7 — no asumir integraciones que no existen |

**Regla general: todo vive en free tiers hasta que haya tráfico real.** El único costo esperado en el MVP es la API de Claude (~US$5-20/mes).

### 8.2 Riesgos técnicos a vigilar

- **Costo variable de la API de Claude con imágenes/video** — el más sensible a monitorear. Mitigar con límite de tamaño/resolución de imagen, tope diario de evaluaciones por alumno, y caché (no re-evaluar la misma entrega).
- **Privacidad de datos de menores** — aunque el uso inicial es familiar y privado, si se abre a terceros aplican consideraciones tipo COPPA/GDPR (fotos, videos y voz de niños son datos sensibles). Minimizar recolección (sin apellidos completos ni fecha de nacimiento exacta ni geolocalización), habilitar borrado de cuenta, y **consultar asesoría legal antes de comercializar** — este documento no reemplaza esa revisión.
- **Fuga de datos entre familias por error de RLS** — el riesgo más crítico del modelo multi-tenant una vez escale. Mitigar con tests automatizados de aislamiento por `family_id` en cada PR.
- **Dependencia de un solo proveedor de IA** — encapsular la evaluación IA detrás de una interfaz propia, para poder cambiar de proveedor si hace falta.
- **Jobs programados silenciosos** — si el cron de reprogramación/penalización falla sin avisar, los alumnos ven estados incorrectos. Agregar logging/alertas mínimas.
- **Crecimiento de storage con video** — definir límite de duración/resolución desde el inicio.

---

## 9. Roadmap de construcción por fases (para que Claude Code lo ejecute en orden)

| Fase | Entregable | Criterio de "hecho" |
|---|---|---|
| **0** | Repo GitHub, Next.js+TS+Tailwind+shadcn, proyecto Supabase, deploy a Vercel, Auth (magic link alumno, password admin) | Login funcional para 2 hijos + 1-2 admins en producción, deploy automático desde `main` |
| **1** | Modelo de datos completo (sección 10) + RLS por `family_id` + admin CRUD básico (categorías, tareas, libros) | Admin crea/edita/borra categorías y tareas desde UI; test confirma que RLS aísla datos entre families |
| **2** | Dashboard heatmap con timeframes día/semana/mes/año | Heatmap renderiza estados reales de `task_instances` y cambia correctamente al alternar timeframe |
| **3** | Motor de tareas/tiempo/puntos: generación diaria de instancias, estados, batches de foco, reprogramación y penalización (sección 6.4) | Cron genera instancias del día; marcar hecho/no hecho actualiza `points_ledger`; tareas vencidas se reprograman/penalizan según regla de 72hs |
| **4** | 15-20 landing pages por materia con contenido seed (sección 7), incluyendo Escritura Creativa, Matemáticas como desafío, Negocios ampliado (emprendimiento + Laboratorio de Mercados + comunidad online) y tracks de Computación (Scratch/Shapr3D) | Cada categoría navegable con módulos; Mente/Lectura/Geografía/Escritura Creativa con contenido real completo; resto con placeholder editable desde admin |
| **5** | Gamificación completa: streaks, badges, ranking con alumnos ficticios y reales (sección 6) | Streaks correctos tras cortes de día; badges se otorgan por criterio; leaderboard mezcla reales/ficticios (flag visible solo admin) |
| **6** | IA: evaluación de caligrafía (foto), reseñas de lectura, mecanografía, capítulos de Escritura Creativa, modelos 3D (Shapr3D, con chequeo programático de medidas), reportes semanales de trading (validación asistida) | Subir foto/video/STL dispara evaluación IA estructurada + override de admin; módulo de mecanografía mide WPM/precisión histórico |
| **7** | Notificaciones: mensaje matutino del mentor + mapa del día, recordatorios, buzón de sugerencias; videos de Public Speaking integrados (transcripción vía Whisper + evaluación de contenido) con pantalla de consentimiento parental y storage privado | Cron diario entrega mensaje personalizado (sección 5.2); alumno envía sugerencia y admin la ve/responde; grabación de video solo se habilita tras consentimiento explícito |
| **8** | Exportación de bitácora en PDF por curso/libro/materia (sección 7.2) | Botón genera PDF con progreso real de un alumno para un recorte dado |
| **9** | Pulido visual, mascota Kai, animaciones, accesibilidad de color | Checklist de UI (sección 5.6) cerrado, sin bloqueos técnicos pendientes |
| **10** | Multi-tenant/billing: onboarding de nueva familia, clonado de plantillas, Stripe | Se da de alta una familia de prueba end-to-end sin tocar código; Stripe cobra un plan de prueba en modo test |

Cada fase debe cerrarse con un **deploy funcional en Vercel** antes de pasar a la siguiente, para no acumular deuda de integración.

### Estimación de costos

| Servicio | Plan MVP | Costo mensual |
|---|---|---|
| Vercel | Hobby | US$0 |
| Supabase | Free | US$0 |
| Resend | Free | US$0 |
| Claude API | Pay-as-you-go, uso bajo | US$5–15 |
| Whisper | Uso bajo | US$0–5 |
| **Total** | | **≈ US$5–20/mes** |

Punto de quiebre estimado para pasar a planes pagos: **5-10 familias activas** subiendo evidencia a diario → US$50-150/mes combinando Supabase Pro + Vercel Pro + costo variable de IA.

---

## 10. Modelo de datos (ERD conceptual)

**Principio de diseño: `family_id` en toda tabla operativa desde el día uno**, aunque hoy exista una sola fila en `families`. Agregar una familia nueva es insertar una fila y aplicar RLS — no rediseñar tablas.

- **families** — `id, name, plan (futuro), created_at`
- **users** — `id, family_id, email, role (parent_admin|student), display_name, avatar_url, birth_year`
- **categories** — `id, family_id, name, color, icon, type (materia|habito), order, active, supports_tracks (boolean — true en Computación)`
- **task_templates** — `id, family_id, category_id, title, description, points_base, duration_minutes, recurrence, focus_batch_required, active`
- **task_instances** — `id, family_id, template_id, student_id, scheduled_date, status (pendiente|hecho|no_hecho|reprogramado), completed_at, points_awarded, penalty_applied, rescheduled_from_id`
- **submissions** — `id, family_id, task_instance_id, student_id, type (foto|video|texto|modelo_3d), file_url, text_content, metadata (jsonb — ej. formato de archivo, dimensiones extraídas del STL), ai_evaluation (jsonb), ai_evaluated_at, admin_override_score, admin_override_comment, reviewed_by`
- **points_ledger** (histórico inmutable) — `id, family_id, student_id, source_type (task|badge|manual_admin|penalty), source_id, points, reason, created_at`
- **badges** — `id, family_id (nullable si global), name, description, icon, criteria (jsonb)`
- **badge_awards** — `id, family_id, student_id, badge_id, awarded_at`
- **books** — `id, family_id, title, author, category_id, total_pages, active`
- **book_progress** — `id, family_id, student_id, book_id, status, pages_read, review_text, ai_evaluation, finished_at`
- **leaderboard_entries** — `id, family_id, student_id (nullable si ficticio), is_fictional, display_name, points_total, period, computed_at`
- **notifications** — `id, family_id, user_id, type (mensaje_diario|recordatorio|feedback_ia), title, body, read_at`
- **feedback_suggestions** — `id, family_id, student_id, message, status (nuevo|visto|respondido), admin_response`
- **typing_sessions** — `id, family_id, student_id, dictation_text, typed_text, wpm, accuracy_pct, errors (jsonb), duration_seconds`
- **story_bible** (Escritura Creativa) — `id, family_id, student_id, titulo_historia, genero, protagonista (jsonb), mundo (jsonb), personajes_secundarios (jsonb), timeline (jsonb), capitulos (jsonb), updated_at`
- **tracks** (Computación y futuras materias con doble camino) — `id, family_id, category_id, slug, name, description, icon, order, active`
- **student_tracks** — `id, family_id, student_id, category_id, track_id, started_at, ended_at (nullable = activo), assigned_by`
- **trading_weekly_reports** (Laboratorio de Mercados) — `id, family_id, student_id, week_start, equity_change_pct, num_positions, screenshot_url, points_awarded, validated_by_admin_at`
- **content_pieces** (Comunidad online/contenido) — `id, family_id, student_id, title, type, published_at, engagement_snapshot (jsonb), points_awarded`

**Relaciones clave:** `families` 1—N `users/categories/task_templates/books/tracks`; `users(student)` 1—N `task_instances/submissions/points_ledger/badge_awards/book_progress/notifications/feedback_suggestions/typing_sessions/story_bible/trading_weekly_reports/content_pieces/student_tracks`; `task_templates` 1—N `task_instances`; `task_instances` 1—1(o 1—N con reintento) `submissions`; `books` 1—N `book_progress`; `badges` 1—N `badge_awards`; `categories` 1—N `tracks`; `tracks` 1—N `student_tracks`.

---

## 11. Multi-tenancy y escalabilidad futura

1. **RLS por `family_id` desde el día uno** en cada tabla (`USING (family_id = auth.jwt() -> 'family_id')`) — con 1 familia no cambia nada visible, pero evita una reescritura riesgosa después.
2. **`family_id` viaja en el JWT/sesión**, nunca se confía en un parámetro del cliente.
3. **Currícula personalizable vía plantillas clonables, no hardcodeada.** El contenido semilla (categorías, libros, badges base) vive en tablas globales `template_*` que se **copian** a cada familia en el onboarding — así, en el futuro, **cada familia nueva puede formatear el programa según los intereses de sus propios hijos** sin tocar el código: edita su copia clonada de categorías/tareas/catálogo.
4. **Roles como enum extensible** (`parent_admin`, `student`, a futuro `teacher`/`co_admin`).
5. **Billing como capa separada y postergada** — se agrega `subscriptions` + middleware de verificación de plan recién al abrir a otras familias.
6. **Onboarding self-service es feature de fase tardía** (Fase 10), no un problema de arquitectura — el modelo ya soporta N familias desde el día uno.
7. Supabase y Vercel escalan por plan/tráfico automáticamente: pasar de 2 a 200 familias es subir de tier, no re-arquitecturar.

---

## 12. Supuestos ya decididos vs. decisiones pendientes de los padres

### Ya decidido (Claude Code puede avanzar sin volver a preguntar esto)

- Alumnos genéricos por ahora (`Alumno 1` / `Alumno 2`) — reemplazar por nombres reales cuando los padres los provean.
- Plataforma **bilingüe ES/EN** (interfaz conmutable; mecanografía/dictado y lecturas también sirven como práctica de inglés).
- Stack **low-cost/free-tier** priorizado sobre máxima escalabilidad inmediata (sección 8).
- Mascota/mentor propuesta: **Kai**, el zorro-guía (sección 5.4) — sujeta a validación visual final con la familia.
- "How dispensa" del pedido original se interpretó como **Dr. Joe Dispenza**, tratado únicamente como práctica de meditación/visualización, nunca como ciencia comprobada.
- **Sistema de diseño Apple-like** (sección 5.0) como estándar visual obligatorio de toda la plataforma, y uso **tablet/desktop** (sin versión celular prioritaria).
- Trading y comunidad online son **educativos y 100% simulados/privados** por defecto (sección 7.7) — no se conecta ninguna cuenta real ni plataforma pública sin decisión explícita de los padres.

### Pendiente de los padres (Claude Code debería preguntar o dejar placeholder claro)

- **Nombres reales de los hijos** y ajustes de intereses puntuales de cada uno para personalizar ejemplos y el ranking ficticio.
- **Cuenta y billing real** de Anthropic (Claude API), Supabase, Vercel, dominio propio — quién los da de alta y paga.
- **Confirmación del nombre/diseño de la mascota** (Kai es una propuesta, no una decisión cerrada).
- **Curación real del catálogo de libros** — el Anexo 14.1 es una lista semilla sugerida; los padres deben aprobar/reemplazar títulos según lo que ya tengan en casa o quieran comprar.
- **Destino del viaje anual del próximo año** (Egipto/Roma/Grecia/otro) para calibrar el currículo de Historia y Geografía de esa etapa.
- **Política de fotos/videos de los chicos**: dónde se almacenan, por cuánto tiempo, quién más las puede ver — importante antes de subir la primera evidencia real.
- **Revisión legal** antes de considerar abrir la plataforma a otras familias de pago (sección 13).
- **Cuenta de Paper Trading en TradingView**: confirmar que el padre la crea a su nombre para que los hijos operen supervisados, y aprobar la fórmula de conversión de ganancia simulada en puntos (sección 7.7).
- **Plataforma pública real para la comunidad online** (si alguna vez se habilita YouTube/blog propio): decidir cuándo y quién la administra — hasta entonces, queda en el espacio privado familiar dentro de la plataforma.
- **Licencia/acceso a Shapr3D** ya en uso por el hijo, y disponibilidad de impresora 3D para el desafío bonus de impresión.
- **Aprobar el catálogo ampliado "Formación del carácter"** (16 títulos nuevos, Anexo 14.1-bis) y decidir si compran *Shackleton's Journey* en inglés o buscan una alternativa en español.
- **Pantalla de consentimiento parental y política de retención de video** (90 días propuesto) antes de habilitar la cámara para los videos integrados de Public Speaking (sección 7.9).

---

## 13. Riesgos, privacidad y consideraciones legales

- Fotos, videos y voz de menores son **datos sensibles**: minimizar recolección (sin apellido completo, sin fecha de nacimiento exacta, sin geolocalización), y habilitar borrado de cuenta/datos desde el día uno del diseño, aunque el uso sea privado y familiar.
- Si en el futuro se abre a otras familias: aplican consideraciones tipo **COPPA** (EE.UU., menores de 13) y normativa de protección de datos local/GDPR — **este documento no reemplaza asesoría legal**, se recomienda consultarla antes de comercializar.
- Moderación de contenido y revisión del propio admin de cada familia antes de que cualquier foto/video de un menor sea visible fuera de su núcleo familiar, especialmente si se habilita algún tipo de interacción entre familias.
- El contenido geopolítico (sección 7.3) requiere revisión humana periódica — la realidad geopolítica cambia y el sistema no debe quedar desactualizado ni sesgado.
- **Trading educativo:** reforzar en todo el producto que es 100% simulado — ningún flujo, copy o mecánica debe sugerir dinero real ni facilitar que un menor abra una cuenta real; la fórmula de puntos (sección 7.7) nunca debe premiar apostar todo a una posición.
- **Comunidad online/contenido:** no integrar ninguna red social real hasta que un adulto la administre explícitamente; verificar la edad mínima (13+) de cualquier plataforma antes de conectar su API — mientras tanto, todo vive en el espacio privado familiar.
- **Video de Public Speaking:** el dato más sensible de toda la plataforma (voz e imagen de menores). Bucket privado, URLs firmadas, cero reconocimiento facial, retención acotada (90 días) y consentimiento parental explícito son **no negociables** antes de activar esta fase (sección 7.9).

---

## 14. Anexos (seed data)

### 14.1 Catálogo semilla de lectura (30 libros)

*(Curado por categoría: ficción clásica, aventura, historia, biografía, ciencia, desarrollo personal, estoicismo/filosofía — en español e inglés. Los padres deben revisar y aprobar/ajustar antes de publicar.)*

El Principito · The Little Prince · Charlie and the Chocolate Factory · Matilda · La isla del tesoro · Hatchet · El diario de Ana Frank (ed. juvenil) · Wonder · Percy Jackson y el ladrón del rayo · Holes · Cuentos de la selva (Horacio Quiroga) · The Boy Who Harnessed the Wind (ed. juvenil) · Malala, mi historia (ed. jóvenes) · Hidden Figures (Young Readers' Edition) · Breves respuestas a las grandes preguntas (adaptación divulgativa) · The Wild Robot · Los cuatro acuerdos (versión joven) · Mindset: la actitud del éxito (resumen ilustrado, Carol Dweck — reemplaza a Tracy/Robbins con base científica apta para la edad) · The Boxcar Children · El asombroso viaje de Pomponio Flato (o similar) · Fábulas de Esopo (selección comentada) · The Boy, the Mole, the Fox and the Horse · Cartas a un joven estoico / El manual de Epicteto para jóvenes (adaptación) · Number the Stars · La vuelta al mundo en 80 días · I Am Malala (Young Readers Edition, en inglés) · Momo (Michael Ende) · Kid Presidents (o similar de biografías breves) · El viejo y el mar (ed. juvenil comentada) · The One and Only Ivan.

*Nota: no existen adaptaciones infantiles serias de Tracy o Robbins; se sustituyeron por Mindset de Dweck y por estoicismo clásico adaptado (Epicteto, Esopo), que cubren la misma necesidad de disciplina/mentalidad con contenido verificable para la edad.*

### 14.1-bis Ampliación "Formación del carácter" (16 libros adicionales)

Categoría inspirada en las lecturas usadas tradicionalmente para transmitir valores a hijos destinados a liderar (ver nota completa en sección 7.2). Ninguno se repite con el catálogo de 30 libros de 14.1; todos evitan violencia gráfica, contenido sexual y ejemplos políticos partidistas contemporáneos.

| # | Título | Autor | Idioma | Valor(es) principal(es) | Por qué se incluye |
|---|---|---|---|---|---|
| 1 | *Shackleton's Journey* | William Grill | en | liderazgo, perseverancia bajo presión | El relato pedido por el padre: trajo a todo su equipo con vida tras casi 2 años atrapados en el hielo antártico |
| 2 | *Out of Darkness: The Story of Louis Braille* | Russell Freedman | en | perseverancia, ingenio, servicio | Un niño ciego que a los 15 crea un sistema que sigue ayudando a millones |
| 3 | *Helen Keller* (biografía juvenil ilustrada) | Margaret Davidson | en | coraje, superación, humildad | Superación de discapacidad múltiple mediante disciplina y guía de un mentor |
| 4 | *The Wright Brothers: How They Invented the Airplane* | Russell Freedman | en | perseverancia, trabajo en equipo | Cientos de intentos fallidos antes del éxito |
| 5 | *Benjamin Franklin* | Ingri y Edgar Parin d'Aulaire | en | disciplina, autoformación, virtud | Diseñó deliberadamente un sistema propio de virtudes para formar su carácter |
| 6 | *Mujercitas* | Louisa May Alcott | es/en | responsabilidad, generosidad, lealtad familiar | Cuatro hermanas que anteponen el deber familiar al interés propio |
| 7 | *Robin Hood* (adaptación juvenil) | Tradicional | es | justicia, generosidad, coraje | Usar la fuerza y la astucia al servicio de los más débiles |
| 8 | *Las leyendas del Rey Arturo* (adaptación juvenil) | Tradicional | es | honor, lealtad, servicio | El código de caballería como sistema explícito de formación de carácter |
| 9 | *El Cantar de Mío Cid* (versión adaptada) | Anónimo | es | honor, lealtad, valentía | Clásico en español centrado en la palabra dada |
| 10 | *Robinson Crusoe* (versión abreviada) | Daniel Defoe | es | autosuficiencia, perseverancia, ingenio | Reconstruir una vida ordenada desde cero |
| 11 | *El león, la bruja y el ropero* | C.S. Lewis | es | coraje, sacrificio, lealtad | Elegir el sacrificio propio por el bien de otros |
| 12 | *Mi lado de la montaña* | Jean Craighead George | es/en | responsabilidad, autosuficiencia | Planificar y sostener solo la propia supervivencia |
| 13 | *Donde crece el helecho rojo* | Wilson Rawls | es/en | lealtad, perseverancia, coraje | Trabajar años por lo que quiere y mantenerse fiel a sus compromisos |
| 14 | *Fábulas de La Fontaine* | Jean de La Fontaine | es | prudencia, humildad, sabiduría práctica | Clásicas en la educación de cortes y familias con tradición de liderazgo |
| 15 | *Amelia Earhart* (biografía juvenil) | Kate Boehm Jerome | en | coraje, determinación | Persistió pese al rechazo repetido; rompió límites con preparación, no suerte |
| 16 | *Kon-Tiki: A través del Pacífico en balsa* (adaptación juvenil) | Thor Heyerdahl | es/en | coraje, trabajo en equipo, espíritu explorador | Expedición real que probó una teoría con planificación meticulosa |

**Ruta de lectura de valores (opcional, no obligatoria):** Fábulas de La Fontaine/Esopo → Robin Hood → Mi lado de la montaña → *Shackleton's Journey* → Benjamin Franklin (d'Aulaire) → Mujercitas — progresión de madurez temática desde la moraleja breve hasta el carácter vivido puertas adentro, desbloqueable como insignia opcional "Ruta del Carácter".

### 14.2 Banco de preguntas de pensamiento crítico (15)

1. ¿Qué hubieras hecho distinto que el protagonista en el momento más difícil de la historia?
2. ¿Qué parte del libro no te convenció o te pareció injusta, y por qué?
3. Si pudieras cambiar el final, ¿cómo lo harías y qué perderíamos con ese cambio?
4. ¿Qué decisión del personaje principal fue la más valiente? ¿Vos la hubieras tomado?
5. ¿Qué problema del libro se parece a algo que viviste u observaste en tu vida real?
6. ¿Qué le dirías al autor si pudieras hacerle una sola pregunta?
7. ¿Qué personaje secundario merecía más protagonismo, y qué historia le darías?
8. ¿Qué idea del libro te pareció más difícil de creer o de aceptar?
9. Si el protagonista te pidiera un consejo antes de su decisión más importante, ¿qué le dirías?
10. ¿Qué parte de la historia te hizo sentir algo fuerte, y por qué creés que fue así?
11. ¿Este libro te cambió de opinión sobre algo? ¿Sobre qué exactamente?
12. ¿Qué hecho histórico o científico del libro te gustaría investigar más a fondo?
13. Según el libro, ¿qué está dentro de tu control y qué no? ¿Estás de acuerdo?
14. ¿Qué haría falta cambiar en el mundo real para que la historia del libro no pudiera pasar (o pasara más seguido)?
15. Si tuvieras que recomendar este libro a un amigo con una sola frase, ¿cuál sería?

### 14.3 Banco de 20 citas rotativas ("cita del día")

1. "Empezá por lo más difícil del día: el resto se vuelve más fácil." — Brian Tracy
2. "No tenés que ser grandioso para empezar, pero tenés que empezar para ser grandioso." — inspirado en Jim Rohn
3. "Lo que siembres hoy, lo vas a cosechar más adelante." — Jim Rohn
4. "La disciplina es elegir entre lo que querés ahora y lo que más querés." — inspirado en Jim Rohn
5. "No dejes que un mal momento se convierta en un mal día." — inspirado en Tony Robbins
6. "Cambiá tu postura y vas a cambiar cómo te sentís." — inspirado en Tony Robbins
7. "Tenés el poder de decidir cómo reaccionar, aunque no puedas elegir lo que pasa." — Marco Aurelio (adaptado)
8. "No busques que las cosas pasen como vos querés; aceptá que pasan como pasan, y vas a estar en paz." — Epicteto (adaptado)
9. "Lo que depende de mí, lo cuido. Lo que no depende de mí, lo dejo ir." — inspirado en Epicteto
10. "Cada mañana es una nueva oportunidad para empezar de nuevo." — Marco Aurelio (adaptado)
11. "No es lo que te pasa, sino cómo lo interpretás, lo que determina cómo te sentís." — Epicteto (adaptado)
12. "El coraje no es no tener miedo, es actuar a pesar del miedo." — inspirado en estoicismo
13. "Respirar hondo antes de reaccionar te da tiempo para elegir mejor." — práctica de mindfulness
14. "Tu mente es como un músculo: cuanto más la entrenás, más fuerte se pone." — inspirado en Dispenza (versión simplificada)
15. "Imaginarte haciéndolo bien te ayuda a prepararte, pero la práctica real es la que te lleva ahí." — versión adaptada
16. "Ser justo con los demás también es ser justo con vos mismo." — Marco Aurelio (adaptado)
17. "No necesitás ser perfecto, necesitás ser constante." — inspirado en Jim Rohn
18. "Un pequeño hábito repetido todos los días vale más que un gran esfuerzo una sola vez." — inspirado en Rohn
19. "Antes de hablar mal de vos mismo, preguntate si le hablarías así a un amigo." — enfoque de bienestar emocional
20. "Hoy hice lo que pude con lo que sabía. Mañana voy a saber un poco más." — espíritu de las *Meditaciones* de Marco Aurelio

### 14.4 Insignias completas (20)

Mente en Calma (7 días seguidos de meditación/journaling) · Guerrero del Sueño (14 días de buen descanso) · Energía Total (30 sesiones de actividad física) · Devorador de Libros (10 libros/resúmenes) · Científico en Acción (3 proyectos de ciencia) · Artista en Ascenso (5 obras subidas) · Chef de la Casa (10 recetas documentadas) · Manos a la Obra (5 tareas domésticas completadas) · Orador Nato (3 presentaciones orales) · Bilingüe en Marcha (20 actividades en el segundo idioma) · Hermano Solidario (5 veces ayudando al hermano) · Voz de la Familia (3 reuniones familiares) · Racha de Hierro (30 días de racha sin romper) · Maestro de la Constancia (90% de tareas semanales, 4 semanas seguidas) · Explorador Completo (1 insignia en cada una de las 7 categorías) · Segunda Oportunidad (5 tareas completadas dentro de la ventana de gracia) · Nivel Superado (alcanzar un nuevo rango) · Proyecto del Mes (completar un proyecto de 20-40 pts) · Cuerpo y Mente (streaks activos en ambas categorías por 2 semanas) · Espíritu de Equipo (actividad colaborativa entre hermanos).

### 14.5 Ejemplo de datos de países (esquema para Geografía)

| Campo | Argentina | Francia | China | Estados Unidos | Cuba | Noruega |
|---|---|---|---|---|---|---|
| Continente | América del Sur | Europa | Asia | América del Norte | América del Norte (Caribe) | Europa |
| Capital | Buenos Aires | París | Pekín | Washington D.C. | La Habana | Oslo |
| Sistema de gobierno | República federal presidencialista | República semipresidencialista | República socialista de partido único | República federal presidencialista | República socialista de partido único | Monarquía constitucional parlamentaria |
| Sistema económico (fuente) | Economía mixta de mercado (FMI) | Economía de mercado (FMI) | Economía mixta con fuerte planificación estatal (Banco Mundial) | Economía de mercado (FMI) | Economía centralmente planificada (CIA World Factbook) | Economía de mercado con alto gasto social (FMI) |
| Organizaciones | ONU, Mercosur, G20 | ONU, UE, OTAN, G7 | ONU (CS permanente), G20 | ONU (CS permanente), OTAN, G7, G20 | ONU | ONU, OTAN, EEE |

*(Datos ilustrativos del esquema — el admin debe verificar cifras y clasificaciones exactas contra las fuentes citadas al cargar la base real, y repetir la verificación en cada revisión periódica.)*

---

**Fin del prompt maestro.** Claude Code: empezá por la Fase 0 de la sección 9. Ante cualquier ambigüedad no cubierta acá, priorizá siempre el principio de la sección 1 (bienestar emocional y comparación contra uno mismo) por sobre cualquier otra decisión de producto.
