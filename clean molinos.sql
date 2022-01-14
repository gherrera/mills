DELETE FROM etapa_eventos;
DELETE FROM tarea_partes;
DELETE FROM etapa_tareas;
DELETE FROM molino_etapas;
DELETE FROM turno_historial;
UPDATE molino_partes SET botadas=0, limpiadas=0, montadas=0, total_botadas=0, total_limpiadas=0, total_montadas=0;
UPDATE molinos SET estado=NULL, etapa=NULL;
UPDATE turnos SET estado=NULL, turno_id=NULL;

INSERT INTO molino_partes
SELECT (@rownum := @rownum + 1) id, '2022-01-14' fecha, nombre, tipo, cantidad, 0, 0, 0, 0, 0, 0, 10
FROM molino_partes a, (SELECT @rownum := 49) r
WHERE molino_id=1

SELECT * FROM turno_personas WHERE turno_id=12

INSERT INTO turno_personas VALUES('19','Guillermo Medina','44433332','Controller','3');
INSERT INTO turno_personas VALUES('19','Jorge Veliz','44433332','Controller','4');

INSERT INTO turno_personas VALUES('20','Oscar Barrios','44433332','Controller','5');
INSERT INTO turno_personas VALUES('20','Jimmy B.','44433332','Controller','6');
