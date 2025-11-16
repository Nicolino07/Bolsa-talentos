:- use_module(library(http/http_server)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).

:- http_handler(root(test), test_handler, []).
test_handler(_Request) :-
    reply_json_dict(_{ok: true}).


% --- Ruta HTTP: /sumar ---
:- http_handler(root(sumar), sumar_handler, []).

% Handler de la suma
sumar_handler(Request) :-
    http_read_json_dict(Request, Dict),
    R is Dict.a + Dict.b,
    reply_json_dict(_{resultado: R}).

start_server :-
    writeln('Servidor Prolog corriendo en 0.0.0.0:5001'),
    http_server(http_dispatch, [port(5001), ip('0.0.0.0')]),
    % PREDICADO BLOQUEANTE: Espera indefinidamente.
    thread_get_message(stop). % Esto mantiene vivo el proceso de Prolog.