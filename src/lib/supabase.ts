import { createClient } from '@supabase/supabase-js';
import { Property, PropertyFilters, PropertyImage, PropertyShare } from '@/types/property';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Configuración de Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Verificar la conexión
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Estado de autenticación Supabase:', event, session?.user?.email);
});

// Función de prueba para verificar la conexión
export const testSupabaseConnection = async () => {
  try {
    console.log('Probando conexión con Supabase...');
    
    // Primero verificamos si podemos hacer un conteo
    const { data: countData, error: countError } = await supabase
      .from('agents')
      .select('count')
      .single();

    if (countError) {
      console.error('Error al contar agentes:', countError);
      return false;
    }

    console.log('Conteo de agentes:', countData);

    // Ahora intentamos obtener un registro
    const { data: testData, error: testError } = await supabase
      .from('agents')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Error al obtener agente de prueba:', testError);
      return false;
    }

    console.log('Datos de prueba obtenidos:', testData);
    console.log('Conexión exitosa con Supabase');
    return true;
  } catch (error) {
    console.error('Error al probar la conexión:', error);
    return false;
  }
};

// Ejecutar prueba de conexión al iniciar
testSupabaseConnection();

export type { Property, PropertyFilters, PropertyImage, PropertyShare };

export const getProperties = async (filters?: PropertyFilters) => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        images:property_images!property_images_property_id_fkey(*)
      `);

    if (filters) {
      if (filters.minPrice) {
        query = query.gte('total_price', parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('total_price', parseFloat(filters.maxPrice));
      }
      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.copropiedades) {
        query = query.eq('total_shares', parseInt(filters.copropiedades));
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProperties:', error);
    return [];
  }
};

interface UploadPropertyImageParams {
  file: File;
  propertyId: string;
  isMain: boolean;
}

export const uploadPropertyImage = async ({ file, propertyId, isMain }: UploadPropertyImageParams) => {
  try {
    // Validar el tamaño del archivo (5MB máximo)
    if (file.size > 5242880) {
      return { data: null, error: new Error('El archivo excede el límite de 5MB') };
    }

    // Validar el tipo de archivo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return { data: null, error: new Error('Tipo de archivo no permitido. Use JPEG, PNG o WebP') };
    }

    const fileName = `${propertyId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Crear un objeto Image para obtener dimensiones
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Error al leer dimensiones de la imagen'));
      img.src = URL.createObjectURL(file);
    });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('properties')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { data: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(fileName);

    // Si es la imagen principal, actualizar las otras imágenes para que no sean principales
    if (isMain) {
      await supabase
        .from('property_images')
        .update({ is_main: false })
        .eq('property_id', propertyId);
    }

    const { data: imageData, error: insertError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        url: publicUrl,
        is_main: isMain,
        file_size: file.size,
        file_type: file.type,
        width: dimensions.width,
        height: dimensions.height
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting image record:', insertError);
      return { data: null, error: insertError };
    }

    return { data: imageData, error: null };
  } catch (error) {
    console.error('Error in uploadPropertyImage:', error);
    return { data: null, error };
  }
};

export const deletePropertyImage = async (imageId: string): Promise<boolean> => {
  try {
    const { data: image, error: fetchError } = await supabase
      .from('property_images')
      .select('url, is_main, property_id')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      console.error('Error fetching image:', fetchError);
      return false;
    }

    // Extraer el nombre del archivo de la URL
    const fileName = image.url.split('/').pop();
    if (!fileName) {
      console.error('Invalid file URL');
      return false;
    }

    // Borrar el archivo del storage
    const { error: storageError } = await supabase.storage
      .from('properties')
      .remove([fileName]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      return false;
    }

    // Si era la imagen principal, hacer que la siguiente imagen sea la principal
    if (image.is_main) {
      const { data: nextImage } = await supabase
        .from('property_images')
        .select('id')
        .eq('property_id', image.property_id)
        .neq('id', imageId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (nextImage) {
        await supabase
          .from('property_images')
          .update({ is_main: true })
          .eq('id', nextImage.id);
      }
    }

    // Borrar el registro de la base de datos
    const { error: dbError } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePropertyImage:', error);
    return false;
  }
};

export const deleteProperty = async (propertyId: string): Promise<boolean> => {
  try {
    // Primero, obtener todas las imágenes de la propiedad
    const { data: images } = await supabase
      .from('property_images')
      .select('url')
      .eq('property_id', propertyId);

    if (images && images.length > 0) {
      // Extraer los nombres de archivo de las URLs
      const fileNames = images.map(image => image.url.split('/').pop()).filter(Boolean);
      
      // Eliminar los archivos del storage
      if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('properties')
          .remove(fileNames as string[]);

        if (storageError) {
          console.error('Error deleting property images from storage:', storageError);
          return false;
        }
      }
    }

    // Eliminar los registros de imágenes (se eliminarán automáticamente por la restricción FK)
    const { error: propertyError } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (propertyError) {
      console.error('Error deleting property:', propertyError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    return false;
  }
};

export const uploadAgentImage = async ({ file, agentId }: { file: File; agentId: string }) => {
  try {
    if (!file) {
      throw new Error('No se ha seleccionado ningún archivo');
    }

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar el tamaño del archivo (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('La imagen no debe superar los 5MB');
    }

    // Generar un nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${agentId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Subir el archivo al bucket
    const { error: uploadError, data } = await supabase.storage
      .from('agent-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from('agent-images')
      .getPublicUrl(filePath);

    return { data: { url: publicUrl }, error: null };
  } catch (error) {
    console.error('Error uploading agent image:', error);
    return { data: null, error };
  }
}; 