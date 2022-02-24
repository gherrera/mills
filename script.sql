DROP TABLE turno_historial;
DROP TABLE turno_personas;
DROP TABLE tarea_partes;
DROP TABLE turnos;
DROP TABLE molino_partes;
DROP TABLE etapa_eventos;
DROP TABLE etapa_tareas;
DROP TABLE molino_etapas;
DROP TABLE molinos;
DROP TABLE faenas;
DROP TABLE clientes;

CREATE TABLE clientes(
id VARCHAR(50) NOT NULL,
nombre VARCHAR(150) NOT NULL,
rut VARCHAR(20),
direccion VARCHAR(200),
contact_name VARCHAR(100),
contact_phone VARCHAR(50),
email VARCHAR(50),
fec_creacion TIMESTAMP,
PRIMARY KEY(id)
);

CREATE TABLE faenas(
id VARCHAR(50) NOT NULL,
nombre VARCHAR(150) NOT NULL,
fec_creacion TIMESTAMP,
cliente_id VARCHAR(50) NOT NULL,
FOREIGN KEY(cliente_id) REFERENCES clientes(id),
PRIMARY KEY(id)
);

CREATE TABLE molinos(
id VARCHAR(50) NOT NULL,
nombre VARCHAR(150) NOT NULL,
tipo VARCHAR(150) NOT NULL,
fec_creacion TIMESTAMP,
create_user VARCHAR(255) NOT NULL,
estado_admin VARCHAR(20),
estado VARCHAR(20),
etapa VARCHAR(20),
horas INT,
orden_trabajo VARCHAR(20),
fec_act TIMESTAMP,
user_act VARCHAR(50),
nro INT NOT NULL AUTO_INCREMENT,
faena_id VARCHAR(50) NOT NULL,
FOREIGN KEY(faena_id) REFERENCES faenas(id),
PRIMARY KEY(id),
INDEX(`nro`)
);

CREATE TABLE turnos(
id VARCHAR(50) NOT NULL,
nombre VARCHAR(150) NOT NULL,
fec_creacion TIMESTAMP,
molino_id VARCHAR(50) NOT NULL,
estado VARCHAR(20),
turno_id VARCHAR(50),
FOREIGN KEY(molino_id) REFERENCES molinos(id),
PRIMARY KEY(id)
);

CREATE TABLE turno_historial(
id VARCHAR(50) NOT NULL,
turno_id VARCHAR(50) NOT NULL,
fecha_inicio TIMESTAMP,
fecha_termino TIMESTAMP,
FOREIGN KEY(turno_id) REFERENCES turnos(id),
PRIMARY KEY(id)
);

CREATE TABLE turno_personas(
turno_id VARCHAR(50) NOT NULL,
nombre VARCHAR(150),
rut VARCHAR(20),
cargo VARCHAR(50),
user_id_controller VARCHAR(50),
FOREIGN KEY(turno_id) REFERENCES turnos(id),
FOREIGN KEY(user_id_controller) REFERENCES users(id)
);

CREATE TABLE molino_partes(
id VARCHAR(50) NOT NULL,
fec_creacion TIMESTAMP,
nombre VARCHAR(150) NOT NULL,
tipo VARCHAR(150) NOT NULL,
cantidad INT,
botadas INT,
limpiadas INT,
montadas INT,
total_botadas INT,
total_limpiadas INT,
total_montadas INT,
molino_id VARCHAR(50) NOT NULL,
FOREIGN KEY(molino_id) REFERENCES molinos(id),
PRIMARY KEY(id)
);

CREATE TABLE molino_etapas(
id VARCHAR(50) NOT NULL,
etapa VARCHAR(50) NOT NULL,
estado VARCHAR(50) NOT NULL,
fecha_inicio TIMESTAMP,
fecha_termino TIMESTAMP,
user_inicio VARCHAR(50),
user_termino VARCHAR(50),
molino_id VARCHAR(50) NOT NULL,
turno_id_inicio VARCHAR(50) NOT NULL,
turno_id_termino VARCHAR(50),
FOREIGN KEY(molino_id) REFERENCES molinos(id),
FOREIGN KEY(turno_id_inicio) REFERENCES turno_historial(id),
FOREIGN KEY(turno_id_termino) REFERENCES turno_historial(id),
PRIMARY KEY(id)
);

CREATE TABLE etapa_eventos(
id INT NOT NULL AUTO_INCREMENT,
tipo VARCHAR(50) NOT NULL,
comentarios VARCHAR(500),
fecha_inicio TIMESTAMP,
fecha_termino TIMESTAMP,
user_inicio VARCHAR(50),
user_termino VARCHAR(50),
etapa_id VARCHAR(50) NOT NULL,
FOREIGN KEY(etapa_id) REFERENCES molino_etapas(id),
PRIMARY KEY(id)
);

CREATE TABLE etapa_tareas(
id VARCHAR(50) NOT NULL,
tarea VARCHAR(50) NOT NULL,
fecha_inicio TIMESTAMP,
fecha_termino TIMESTAMP,
user_inicio VARCHAR(50),
user_termino VARCHAR(50),
turno_id_inicio VARCHAR(50) NOT NULL,
turno_id_termino VARCHAR(50),
etapa_id VARCHAR(50) NOT NULL,
FOREIGN KEY(etapa_id) REFERENCES molino_etapas(id),
FOREIGN KEY(turno_id_inicio) REFERENCES turno_historial(id),
FOREIGN KEY(turno_id_termino) REFERENCES turno_historial(id),
PRIMARY KEY(id)
);

CREATE TABLE tarea_partes(
id VARCHAR(50) NOT NULL,
fecha TIMESTAMP,
usuario VARCHAR(50),
cantidad INT,
tarea_id VARCHAR(50) NOT NULL,
parte_id VARCHAR(50) NOT NULL,
turno_id VARCHAR(50),
FOREIGN KEY(tarea_id) REFERENCES etapa_tareas(id),
FOREIGN KEY(parte_id) REFERENCES molino_partes(id),
FOREIGN KEY(turno_id) REFERENCES turno_historial(id),
PRIMARY KEY(id)
);
