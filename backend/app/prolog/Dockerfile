FROM swipl:latest
WORKDIR /app
COPY server.pl .
CMD ["swipl", "-s", "/app/server.pl", "-g", "start_server"]