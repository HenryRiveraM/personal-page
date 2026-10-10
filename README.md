# Portafolio de Henry Rivera

Sitio personal estático, responsive y sin paso de compilación.

## Ejecutar localmente

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Estructura

- `index.html`: contenido y estructura semántica.
- `proyectos.html`: galería completa con filtros y fichas de cada proyecto.
- `projects.css` y `projects.js`: presentación de proyectos, rotación y fichas ampliables.
- `styles.css`: sistema visual, responsive y temas claro/oscuro.
- `script.js`: navegación móvil, tema, estados activos y apariciones progresivas.
- `robots.txt`: acceso básico para rastreadores.
- `site.webmanifest` y `assets/favicon/`: identidad de navegador, iOS y Android.
- `assets/projects/`: capturas WebP optimizadas y variantes responsive.
- `assets/hero/`: visual principal y variante responsive.

## Presentación de proyectos

La portada muestra Lils, Coca-Cola Eventos y Rudolft en una selección que rota cada 6,5 segundos mientras está visible. Se puede pausar o cambiar con las flechas, los selectores y el teclado. La interacción manual detiene la rotación; la preferencia de movimiento reducido la desactiva de inicio.

La galería de `proyectos.html` contiene los seis proyectos y filtros por Interfaces, UX/UI y Sistemas. Sus fichas tienen enlaces directos, por ejemplo `proyectos.html#lils`, y admiten el botón Atrás del navegador. El video de Lils se carga al reproducirlo. Sin JavaScript, las imágenes y descripciones siguen disponibles.

Para agregar un proyecto, añade una tarjeta con su categoría y plantilla de detalle en `proyectos.html`, y actualiza los contadores. La selección de la portada se mantiene de forma independiente en `index.html`.

## Datos pendientes antes de publicar

- Añadir la URL real de LinkedIn.
- Añadir el CV real antes de mostrar un botón de descarga.
- Confirmar el dominio para agregar canonical, sitemap y datos estructurados con URLs absolutas.
- Agregar una imagen social (`og:image`) y, si se desea, una fotografía profesional.
