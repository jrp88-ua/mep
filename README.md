# MEP
Aplicación desarrollada como trabajo de fin de grado de la carrera de Ingeniería Informática en la Universidad de Alicante.


## Cómo compilar
En la sección de "Releases" ya se ofrecen binarios compilados para cada plataforma, sin embargo, compilar el proyecto es sencillo.
### Requisitos
1. Cumplir con los requisitos expuestos en la [guía de Tauri](https://tauri.app/v1/guides/getting-started/prerequisites/)
2. NodeJS v20.11.0 o superior
3. NPM v10.2.4 o superior
4. rustc 1.76.0 o superior
5. cargo 1.76.0 o superior
### Pasos para compilar
Primero instalar las dependencias de NPM con el comando
```
npm i
```
Luego, construír el proyecto con
```
npm run tauri build
```
Para ejecutar una instancia de desarrollo usar
```
npm run tauri dev
```