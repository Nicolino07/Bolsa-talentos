FROM python:3.11
# Evita preguntas interactivas del "APT" para no romper docker
ENV DEBIAN_FRONTEND=noninteractive

# Agregar repo unstable (SWI-Prolog más completo)
RUN echo "deb http://deb.debian.org/debian unstable main" >> /etc/apt/sources.list

# Pinning para no romper la imagen
RUN printf "Package: *\nPin: release a=unstable\nPin-Priority: 90\n" > /etc/apt/preferences.d/limit-unstable

# Instalar SWI-Prolog
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        swi-prolog \
        swi-prolog-nox \
        libgmp-dev \
        build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Configurar directorio de trabajo
WORKDIR /backend

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el backend (incluyendo Prolog)
COPY . .

# Copiar script de inicio y darle permisos
COPY startScript.sh .

# Instala dos2unix
RUN apt-get update && apt-get install -y dos2unix
# Convierte el formato de línea
RUN dos2unix startScript.sh

RUN chmod +x startScript.sh

# Ejecutar script al iniciar contenedor
CMD ["./startScript.sh"]
