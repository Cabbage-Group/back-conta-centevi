# Agrupacion de datos en Excel

    - Este proyecto es una aplicación te permite cargar, procesar y agrupar datos desde un archivo Excel. La aplicación es flexible y puede agrupar datos en función de diferentes criterios basados en el tipo de sucursal
    
1- Clona el repositorio y entra a la rama dev_cesar:

    ```bash
    - git clone https://github.com/Cabbage-Group/back-conta-centevi.git
    
    - cd back-conta-centevi
    
    
    ```
    
2- Ejecutar la aplicacion:

    ```bash
    npm install
    npm run start:dev
    ```
    
3 - Abrir Postman 

    -  Hacer una peticion de tipo post al siguiente link
    
       ```
      http://localhost:3008/agrupar-fecha-referencia
      ```
      
    -  Ir a body -> form-data he insertar la siguiente key-value
    
        -  key[file] =value[archivo.xlsx]
    
    -  El resultado de hacer esta peticion sera 
    
       ```json
          {
              "downloadLink": "http://127.0.0.1:3008/download/archivo_agrupado_1721254935308.xlsx"
          }
       
          ```
          
    - El enlace generado te permitirá descargar un archivo `.xlsx` con los datos agrupados.
