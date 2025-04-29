#!/bin/bash

# Renombrar archivos de componentes
for file in $(find frontend/src/components -type f -name "Base*.vue"); do
    new_file=$(echo $file | sed 's/Base/Vxv/')
    mkdir -p $(dirname $new_file)
    cp $file $new_file
done

# Renombrar archivos de documentación
for file in $(find frontend/docs -type f -name "Base*.md"); do
    new_file=$(echo $file | sed 's/Base/Vxv/')
    mkdir -p $(dirname $new_file)
    cp $file $new_file
done

echo "Archivos copiados con el nuevo nombre. Ahora debes actualizar el contenido."
