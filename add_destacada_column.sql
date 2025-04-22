-- Añadir columna 'destacada' a la tabla properties
ALTER TABLE properties ADD COLUMN destacada BOOLEAN DEFAULT FALSE;

-- Actualizar algunas propiedades para marcarlas como destacadas (ajusta los IDs según tus datos)
-- Puedes ejecutar solo esta parte después de identificar las propiedades que quieres destacar
-- UPDATE properties SET destacada = TRUE WHERE id IN ('id1', 'id2', 'id3'); 