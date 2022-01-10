DELETE FROM etapa_eventos;
DELETE FROM tarea_partes;
DELETE FROM etapa_tareas;
DELETE FROM molino_etapas;
DELETE FROM turno_historial;
UPDATE molino_partes SET botadas=0, limpiadas=0, montadas=0, total_botadas=0, total_limpiadas=0, total_montadas=0;