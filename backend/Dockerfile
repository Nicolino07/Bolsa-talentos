FROM python:3.11

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

RUN chmod +x startScript.sh #permisos para ejecución en windows
CMD ["sh", "startScript.sh"]