# We-Cook

Ya he subido los cambios que habiamos dicho en la reunion, porfavor clona este repositorio y tambien la migracion de la base de datos que esta en la carpeta db 
actualiza esos 2 por favor si todo lo clonas perfectamente tienes que cambiar la contraseña en la 
ruta /routes/home.js fila 9 donde esta la configuracion de la base de datos mira bien si todo esta correcto ya que tienes una contraseña diferente y por si acaso tambien mira el puerto
cuando vayas a ejecutar el servidor por favor usa el comando > nodemon app.js en la terminal

## Instalacion necesaria para el proyecto:
- node.js ultima version o la mas estable y como base de datos vamos a usar Postgres como una Instalacion opcional puede usar el DBeaver por mas comodidad

y tambien para que vea la entidad relacion de la base de datos 

https://nodejs.org/es/
https://www.postgresql.org/download/
- Por el momento se esta usando la api https://www.themealdb.com/api.php y para la
## Instalar las dependencias de node con:
- npm install --paquete
## Dependencias que se usaron:

1. HTTP:

axios : "^1.3.4"
node-fetch : "^2.6.9"
request : "^2.88.2"
2. Seguridad:

bcrypt : "^5.1.0"
3. Web:

body-parser : "^1.20.2"
express : "^4.18.2"
ejs : "^3.1.9"
bootstrap-icons : "^1.10.3"
path : "^0.12.7"
4. Sessiones y Autenticación:

express-session : "^1.17.3"
connect-flash : "^0.1.1"
connect-pg-simple : "^8.0.0"
cookie-parser : "^1.4.6"
passport : "^0.6.0"
passport-local : "^1.0.0"
passport-local-mongoose : "^8.0.0"
5. Base de datos:

pg : "^8.10.0"
fs : "^0.0.1-security"
6. Otros:

cors : "^2.8.5"
render : "^0.1.4"
- ej: npm install node-fetch o npm i fs
### Los archivos de javascript tienen los metodos que se usaron para insertar y consultar en la base de datos. Para insertar los datos, primero se tradujo el archivo segundo esa traduccion se paso a un archivo JSON y por ultimo se paso a la base de datos copiando cada atributo y tabla que correspondia.
### para importar la base de datos por favor vea este video:
https://www.youtube.com/watch?v=icEvkyIXqug
### para clonar el proyecto de github por favor vea este video:
https://www.youtube.com/watch?v=kw72-dm7yNI

#Para ejecutar el programa abrir una nueva terminal en la consola y ejecutar node app.js y en el navegador colocar http://localhost/3000/home
