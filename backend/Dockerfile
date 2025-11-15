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

# Python deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copiamos todo el backend y Prolog
COPY . .

# Copiamos el script de inicio y le damos permisos
COPY startScript.sh /app/startScript.sh
RUN chmod +x /app/startScript.sh

# Arranca ambos servicios
CMD ["/app/startScript.sh"]




