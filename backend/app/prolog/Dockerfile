FROM swipl

WORKDIR /app

COPY server.pl /app/server.pl
COPY reglas.pl /app/reglas.pl

EXPOSE 4000

CMD ["swipl", "-q", "-s", "server.pl"]
