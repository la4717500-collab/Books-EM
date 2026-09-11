# 📚 Ebook - Librería Online & Catálogo Literario

Aplicación web moderna y responsiva para venta de libros con integración directa a **WhatsApp**, conversión de monedas en tiempo real con **tasas del Banco Central de Venezuela (BCV)** y un completo **Panel de Administración en pantalla completa**.

---

## ✨ Características Principales

- 📖 **Catálogo Interactivo**: Búsqueda instantánea, filtrado por géneros literarios, libros destacados y estados de disponibilidad (Disponible, Bajo Pedido, Agotado).
- 💬 **Compra Directa por WhatsApp**: Genera un mensaje pre-formateado con los detalles del libro, precio en divisas y estimado en Bolívares (Bs.).
- 🇻🇪 **Monitor Oficial de Tasas BCV**: Muestra y sincroniza en tiempo real las tasas oficiales de USD y EUR del Banco Central de Venezuela, con calculadora para presupuestos y ajuste manual de contingencia.
- 🛠️ **Panel de Administración Completo**:
  - Gestión integral de publicaciones (alta, edición, eliminación, destacados y estados).
  - Subida directa de imágenes y fotos de portada desde el dispositivo.
  - Personalización de la plantilla de pedidos por WhatsApp y número de contacto.
  - Ajustes comerciales de la tienda (nombre, moneda, métodos de pago, ubicación).
  - Seguridad mediante PIN de acceso de administrador.
- 💾 **Persistencia de Datos**: Almacenamiento local seguro (`localStorage`) sin necesidad obligatoria de servidores externos para puesta en marcha inmediata.
- 🚀 **Optimizado para Producción**: Código modular, división inteligente de código (*code-splitting* con carga diferida del panel de administración) y configuración lista para **Vercel**.

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 6** (Empaquetador ultrarrápido)
- **Tailwind CSS v4** (Estilos modernos y responsivos)
- **Lucide React** (Iconografía limpia)
- **Vercel** (Despliegue global en CDN con enrutamiento SPA y caché)

---

## 💻 Instalación y Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/ebook-tienda-literaria.git
cd ebook-tienda-literaria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

### 4. Compilar para producción
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `dist/`.

---

## 🚀 Cómo Subir a GitHub

Si aún no has inicializado el repositorio en Git:

```bash
# 1. Inicializar git (si no está inicializado)
git init

# 2. Agregar todos los archivos al staging
git add .

# 3. Crear el primer commit
git commit -m "feat: Librería Ebook con compras WhatsApp y monitor BCV"

# 4. Establecer la rama principal
git branch -M main

# 5. Conectar con tu repositorio en GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/ebook-tienda-literaria.git

# 6. Subir el proyecto
git push -u origin main
```

---

## 🌐 Cómo Publicar en Vercel

La aplicación ya incluye el archivo `vercel.json` configurado para gestionar el enrutamiento de páginas simples (SPA) y la caché inmutable de recursos estáticos.

### Opción 1: Desde la web de Vercel (Recomendada)
1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New Project"** y selecciona **"Import Git Repository"**.
3. Selecciona tu repositorio recién subido (`ebook-tienda-literaria`).
4. Verifica los ajustes del proyecto:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Haz clic en **"Deploy"**.
6. ¡En unos segundos tu tienda literaria estará en línea con dominio HTTPS gratuito!

### Opción 2: Usando Vercel CLI
```bash
npm i -g vercel
vercel
```
Sigue las instrucciones en consola aceptando los valores por defecto. Para producción final ejecuta:
```bash
vercel --prod
```

---

## 🔐 Acceso al Panel de Administración

- Para ingresar al panel, haz clic en el botón de candado/administración en el pie de página o en el encabezado.
- La clave por defecto configurada es: `1234`
- Puedes cambiar la clave en cualquier momento desde la pestaña **Tienda / Ajustes** dentro del panel administrativo.

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.
