:- use_module(library(http/http_server)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).

% --- Ruta HTTP: /sumar ---
:- http_handler(root(sumar), sumar_handler, []).

% Handler de la suma
sumar_handler(Request) :-
    http_read_json_dict(Request, Dict),
    R is Dict.a + Dict.b,
    reply_json_dict(_{resultado: R}).

% Iniciar el servidor
start_server :-
    http_server(http_dispatch, [port(5001)]).