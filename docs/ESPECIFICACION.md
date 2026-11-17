# App personal de ahorro y presupuesto mensual

## 1. Qué es

Una aplicación web **solo para uso personal** (un único usuario) para repartir cada mes el sueldo en "sobres" (casa, salir, super, compras...) y no gastar más de lo previsto. Debe ser **muy fácil de usar desde el móvil**, bonita, y funcionar como una app instalada (PWA).

Tiene **login (autenticación)** y los datos se guardan en una **base de datos relacional PostgreSQL en la nube** (Supabase), en tablas normales con claves foráneas, asociadas a la cuenta del usuario. Así se ven los mismos datos desde cualquier dispositivo, no se pierden al cambiar de móvil y nadie más puede verlos.

## 2. Idea de funcionamiento (el flujo del mes)

1. Al empezar el mes, el usuario introduce **cuánto ha cobrado** (ej. 1.800 €).
2. Primero se apartan las **cantidades fijas**:
   - Ahorro objetivo (ej. 600 €).
   - Aportaciones fijas, como "Padres" (ej. 200 €). Pueden ser varias y se pueden añadir o quitar.
3. Lo que queda se **reparte en categorías** (Casa, Salir, Super, Compras/ropa/juegos, y las que quiera añadir). Cada categoría tiene un importe en €.
4. La app muestra siempre un indicador claro: **"Sin asignar: X €"**. Debe llegar a 0 para dar el mes por planificado. Si se pasa, se muestra en rojo.
5. Durante el mes, el usuario apunta **gastos rápidos** ("-35 € en Super") y ve cuánto le queda en cada categoría.
6. Al cambiar de mes, puede **copiar la plantilla del mes anterior** (mismas categorías e importes) y solo cambiar lo necesario.

## 3. Funcionalidades

### Versión 1 (imprescindible)
- **Pantalla Resumen (inicio)**: mes actual, sueldo, ahorro objetivo, "sin asignar", y una tarjeta por categoría con barra de progreso (gastado / presupuesto) y lo que queda.
- **Pantalla Planificar mes**: editar sueldo, ahorro, aportaciones fijas y categorías. Los importes se editan en euros. Muestra "sin asignar" en tiempo real.
- **Añadir gasto rápido**: botón flotante (+) → elegir categoría, importe, nota opcional y fecha (hoy por defecto). Debe poder hacerse en menos de 5 segundos.
- **Lista de gastos** del mes, con opción de editar y borrar.
- **Cambio de mes**: navegar a meses anteriores (solo lectura cómoda) y crear el mes nuevo copiando el anterior.
- **Categorías personalizables**: nombre, icono y color.
- **Login**: pantalla de inicio de sesión con email y contraseña (y opcionalmente "Entrar con Google"). La sesión se mantiene abierta en el dispositivo para no tener que entrar cada vez. Botón de "Cerrar sesión" en Ajustes. Opción de recuperar contraseña por email.
- **Datos en la nube**: planes, gastos y categorías se guardan en tablas de PostgreSQL (Supabase) ligadas al usuario autenticado y se ven igual desde cualquier dispositivo.
- **Exportar datos** (JSON o CSV) en Ajustes, como copia de seguridad extra (opcional, baja prioridad).
- **PWA instalable**: que se pueda "Añadir a pantalla de inicio". La versión 1 **necesita conexión a internet**; si no hay, mostrar un mensaje claro en vez de fallar. (El modo sin conexión queda para la versión 2.)

### Versión 2 (opcional, para más adelante)
- Histórico con gráfica: ahorro real por mes, evolución de gastos por categoría.
- Aviso al superar el 80 % y el 100 % de una categoría.
- Meta de ahorro anual ("llevo 3.600 € de 7.200 €").
- Gastos fijos recurrentes (alquiler, suscripciones) que se apuntan solos cada mes.
- Modo oscuro.

## 4. Reglas de negocio

- `sin_asignar = sueldo - ahorro - suma(aportaciones fijas) - suma(presupuestos de categorías)`
- Gastado de una categoría = suma de sus gastos del mes. Restante = presupuesto - gastado (puede ser negativo, se muestra en rojo).
- El **ahorro real** del mes = sueldo - aportaciones fijas - gastado total. Se muestra comparado con el objetivo (¿he llegado a mis 600 €?).
- Cada mes es independiente: cambiar el presupuesto de un mes no modifica meses anteriores.
- Los importes se manejan en **céntimos (enteros)** internamente para evitar errores de decimales, y se muestran formateados en euros con `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`.

## 5. Modelo de datos (guardado en el dispositivo)

```ts
type Category = { id: string; name: string; icon: string; color: string };

type MonthPlan = {
  month: string;                 // "2026-11"
  income: number;                // cents
  savingsGoal: number;           // cents
  fixedItems: { id: string; name: string; amount: number }[]; // e.g. "Padres"
  budgets: { categoryId: string; amount: number }[];
};

type Expense = {
  id: string;
  month: string;                 // "2026-11"
  categoryId: string;
  amount: number;                // cents
  note?: string;
  date: string;                  // ISO date
};
```

Persistencia: **Supabase (PostgreSQL)**, con tablas relacionales. Los tipos de arriba están en camelCase para el código; en la base de datos las columnas van en `snake_case`.

### Tablas

Todas llevan `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade` y `created_at timestamptz default now()`. Las claves primarias son `uuid` (`gen_random_uuid()`). Los importes son **enteros en céntimos** (`integer`) con `check (amount_cents >= 0)`.

| Tabla | Columnas principales | Notas |
|---|---|---|
| `categories` | `id`, `name`, `icon`, `color`, `sort_order`, `archived boolean default false` | Archivar en vez de borrar, para no perder el histórico de gastos |
| `month_plans` | `id`, `month text` ("2026-11"), `income_cents`, `savings_goal_cents` | `unique (user_id, month)` |
| `fixed_items` | `id`, `month_plan_id` → `month_plans` (`on delete cascade`), `name`, `amount_cents` | Aportaciones fijas (Padres, etc.) |
| `budgets` | `id`, `month_plan_id` → `month_plans` (`on delete cascade`), `category_id` → `categories`, `amount_cents` | `unique (month_plan_id, category_id)` |
| `expenses` | `id`, `category_id` → `categories`, `month text`, `amount_cents`, `note`, `spent_on date` | Índice en `(user_id, month)` |

### Seguridad (obligatorio)
- **Row Level Security (RLS) activada en todas las tablas**, con políticas `using (user_id = auth.uid()) with check (user_id = auth.uid())` para select, insert, update y delete. Es lo que impide que otro usuario, o alguien sin sesión, lea o escriba los datos.
- La clave `anon` de Supabase va en variables de entorno `VITE_...` y **no es un secreto** (es pública por diseño): lo que protege los datos es RLS. **Nunca** usar la clave `service_role` en el frontend ni subirla al repositorio.
- App de uso personal: tras crear la cuenta del usuario, **desactivar el registro de nuevos usuarios** en Supabase (Authentication → Sign In / Providers → desactivar "Allow new users to sign up").
- No guardar contraseñas ni datos sensibles en el código ni en el repositorio.

### Migraciones
- El esquema (tablas, índices, políticas RLS) se escribe como ficheros SQL versionados en `supabase/migrations/` dentro del repositorio, para poder recrearlo desde cero.
- Generar los tipos TypeScript desde la base de datos con `supabase gen types typescript` y usarlos en el código.

### Aviso de Supabase gratuito
Los proyectos del plan gratuito se **pausan tras 7 días sin actividad** (se reactivan con un clic desde el panel, y los datos se conservan). Documentar esto en el README. Opcional: un GitHub Action programado que haga una consulta sencilla cada pocos días para evitar la pausa.

## 6. Stack técnico

- **React + TypeScript + Vite**.
- **MUI** para la interfaz (usar componentes de MUI siempre que sea posible en vez de crear UI propia). Tema personalizado (colores, bordes redondeados).
- **Supabase** (plan gratuito): **Auth** (email/contraseña, opcionalmente Google) y **PostgreSQL** como base de datos, con `@supabase/supabase-js`.
- **TanStack Query** (`@tanstack/react-query`) para pedir, cachear y refrescar los datos de Supabase (así se evita `useEffect` para cargar datos). Tras crear o borrar algo, invalidar la consulta correspondiente.
- **Sesión**: encapsular `supabase.auth.onAuthStateChange` en un hook propio con `useSyncExternalStore` (sin `useEffect`).
- **Zustand** solo para estado de la interfaz (mes seleccionado, etc.).
- **Rutas protegidas**: si no hay sesión, redirigir a la pantalla de login.
- **react-router** para las pantallas (Resumen, Planificar, Gastos, Ajustes) con **barra de navegación inferior** (`BottomNavigation` de MUI).
- **vite-plugin-pwa** para manifest, service worker y modo offline.
- **Recharts** (o `@mui/x-charts`) solo si se hace la versión 2.
- **Vitest + Testing Library** para tests de la lógica de cálculo (sin asignar, restante, ahorro real) y de los componentes principales.
- Sin servidor propio: todo con Supabase.

## 7. Diseño y experiencia (lo más importante)

- **Mobile first**: se diseña primero para móvil (360-430 px de ancho) y luego se adapta a escritorio con un contenedor centrado de ancho máximo.
- Zonas táctiles grandes (mínimo 44 px), botón (+) flotante abajo a la derecha, al alcance del pulgar.
- Estilo limpio, moderno y agradable: tarjetas con bordes redondeados, sombras suaves, tipografía clara (por ejemplo Inter), iconos de MUI, colores por categoría.
- Los importes son los protagonistas: números grandes y fáciles de leer.
- Colores con significado: verde = bien, ámbar = cerca del límite, rojo = pasado.
- Al escribir importes, abrir el teclado numérico del móvil (`inputMode="decimal"`).
- Que se sienta rápido: nada de pantallas de carga, animaciones suaves y discretas.
- Textos de la interfaz en **español**.
- Accesibilidad básica: contraste suficiente, etiquetas en los campos.

## 8. Convenciones de código (obligatorias)

- **Evitar `useEffect`** siempre que se pueda: mover la lógica a handlers o a funciones del store. Solo usarlo si no hay otra alternativa razonable.
- **Renderizado condicional siempre con operador ternario** (nunca `&&` ni `if` fuera del JSX).
- **Props siempre en línea** al usar los componentes (no meterlas antes en variables u objetos intermedios).
- Código y comentarios **en inglés**; textos de la interfaz en español.
- Componentes pequeños, lógica de cálculo en funciones puras separadas (`src/lib/budget.ts`) y con tests.
- TypeScript estricto, sin `any`.

## 9. Estructura sugerida

```
src/
  components/    // CategoryCard, ExpenseForm, AmountInput, BottomNav...
  pages/         // Summary, Plan, Expenses, Settings
  store/         // Zustand store + persist
  lib/           // budget.ts (cálculos), money.ts (formato), backup.ts
  theme.ts
```

## 10. Publicación

- Publicar gratis en **Vercel** o **Netlify** (o GitHub Pages), con despliegue automático al hacer push.
- Debe quedar con HTTPS (necesario para la PWA) y poder instalarse desde el móvil con "Añadir a pantalla de inicio".
- Incluir un `README.md` corto con cómo arrancar, probar y desplegar.

## 10b. Icono de la app (PWA)

- Crear un icono sencillo y reconocible: fondo de color sólido (el color principal del tema) con un símbolo blanco centrado (hucha, moneda o monedas apiladas). Sin texto.
- Hacerlo en **SVG** (`public/icon.svg`) y generar los PNG a partir de él con `@vite-pwa/assets-generator` (o `pwa-asset-generator`).
- Tamaños necesarios: `192x192`, `512x512`, una versión **maskable** `512x512` (con el símbolo dentro del 80 % central, para que Android no lo recorte) y `apple-touch-icon` de `180x180` para iOS.
- Declararlos en el manifest de `vite-plugin-pwa` (`icons`), junto con `name`, `short_name`, `theme_color` y `background_color` iguales al color del icono.
- Añadir `favicon.ico` / `favicon.svg` para la pestaña del navegador.
- Comprobar que al "Añadir a pantalla de inicio" el icono se ve bien en Android y en iOS.

## 10c. Requisitos específicos para iPhone (Safari / iOS) — PRIORITARIO

El usuario usa **iPhone**, así que la app debe funcionar perfecta en Safari iOS. Tener en cuenta:

- **Instalación**: en iOS no hay aviso de instalar. Se instala desde Safari con Compartir → "Añadir a pantalla de inicio". Añadir una pequeña **guía en Ajustes** ("Cómo instalar en iPhone") con esos pasos.
- **Icono**: iOS usa `apple-touch-icon` de **180x180**, en PNG, **sin transparencia** (si la tiene, iOS la pinta de negro) y sin esquinas redondeadas (iOS las redondea solo). Declararlo en el `index.html`:
  `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
- **Meta tags en `index.html`**:
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="default">` (o `black-translucent` si el diseño lo pide)
  - `<meta name="apple-mobile-web-app-title" content="Ahorro">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- **Zonas seguras (notch y barra inferior del iPhone)**: respetar `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`. La barra de navegación inferior y el botón (+) no deben quedar tapados por la barra de inicio del iPhone.
- **Zoom automático en inputs**: Safari hace zoom al enfocar un campo con tamaño de letra menor de 16 px. Todos los inputs deben tener **mínimo 16 px**.
- **Altura de pantalla**: usar `100dvh` (no `100vh`) para que la barra de Safari no descuadre el diseño.
- **Sesión separada**: en iOS la app instalada en la pantalla de inicio y Safari **no comparten la sesión iniciada**, así que hay que iniciar sesión una vez dentro de la app instalada. Los datos son los mismos porque están en la nube. Avisarlo en la guía de instalación.
- **Login en iOS**: el inicio de sesión con Google mediante ventana emergente puede fallar en la app instalada de iOS; si se usa Google, hacerlo con redirección (`signInWithOAuth` con `redirectTo`, sin popup), o dejar solo email/contraseña. Los gestores de contraseñas de iOS deben poder rellenar el formulario (usar `autocomplete="email"` y `autocomplete="current-password"`).
- **Exportar en iOS** (si se implementa): usar la hoja de compartir nativa (`navigator.share` con un fichero), con la descarga normal como alternativa.
- **Sin funciones no soportadas**: no depender de notificaciones push ni de APIs no disponibles en Safari iOS.
- **Gestos**: evitar el rebote al hacer scroll (`overscroll-behavior`) y desactivar el resaltado al tocar (`-webkit-tap-highlight-color: transparent`).
- Probar siempre en un iPhone real o en el simulador de iOS antes de dar algo por terminado.

## 11. Cómo quiero que trabajes

- Empieza por un esqueleto funcional: tema, navegación inferior y las 4 pantallas vacías.
- Después: lógica de cálculo con tests → pantalla Planificar → gasto rápido → Resumen → copia de seguridad → PWA.
- Haz commits pequeños y claros, uno por paso.
- Explícame brevemente al terminar cada paso qué has hecho, en lenguaje sencillo (soy frontend React, pero estoy aprendiendo).
- Si hay una decisión importante, pregúntame; si no, decide tú con criterio y sigue.

## 12. Criterios de aceptación (la app está lista cuando...)

- [ ] Puedo planificar un mes en el móvil (sueldo, ahorro 600 €, 200 € para mis padres y el resto en categorías) y veo "Sin asignar: 0 €".
- [ ] Puedo apuntar un gasto en menos de 5 segundos y veo cómo baja el restante de su categoría.
- [ ] Veo claramente cuánto he ahorrado de verdad frente a mi objetivo.
- [ ] Puedo crear el mes siguiente copiando el anterior.
- [ ] Tengo que iniciar sesión para ver nada, y la sesión se mantiene abierta en el móvil.
- [ ] Los datos se guardan en tablas de PostgreSQL (Supabase) y los veo igual desde el móvil y desde el ordenador.
- [ ] RLS está activada en todas las tablas: otro usuario (o alguien sin sesión) no puede leer ni escribir mis datos, y el registro de nuevos usuarios está desactivado.
- [ ] El esquema está en `supabase/migrations/` y se puede recrear desde cero.
- [ ] Sin conexión la app muestra un mensaje claro en vez de romperse.
- [ ] Se instala en la pantalla de inicio del iPhone (Safari → Compartir → Añadir a pantalla de inicio), con su icono correcto, y funciona sin conexión.
- [ ] En iPhone nada queda tapado por el notch ni por la barra inferior, y Safari no hace zoom al escribir.
- [ ] Los tests de los cálculos pasan.
- [ ] Está publicada en una URL pública con HTTPS.
