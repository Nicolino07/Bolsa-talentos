FROM swipl
# Imagen base de SWI-Prolog para el motor de reglas lógicas

WORKDIR /app
# Establece el directorio de trabajo dentro del contenedor

COPY server.pl /app/server.pl
COPY reglas.pl /app/reglas.pl
# Copia los archivos de reglas Prolog al contenedor

EXPOSE 4000
# Expone el puerto 4000 para conexiones HTTP al motor Prolog

CMD ["swipl", "-q", "-s", "server.pl"]
# Comando que inicia el servidor Prolog en modo silencioso
# (-q =suprime mensajes de inicio y banners del interprete)