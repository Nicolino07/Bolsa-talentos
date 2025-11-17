nivel_valor("principiante", 1).
nivel_valor("intermedio", 2).
nivel_valor("avanzado", 3).
nivel_valor("experto", 4).

% Cálculo de puntaje CORREGIDO
puntaje_actividad(NivelPersona, Anios, NivelReq, Puntaje) :-
    nivel_valor(NivelPersona, VP),
    nivel_valor(NivelReq, VR),
    VP >= VR,
    % Fórmula corregida: valores mas significativos
    Puntaje is (VP * 20) + (Anios * 5).  % Ej: intermedio(2) + 4 años = 40 + 20 = 60

puntaje_actividad(NivelPersona, _, NivelReq, 0) :-
    nivel_valor(NivelPersona, VP),
    nivel_valor(NivelReq, VR),
    VP < VR.

puntajes_parciales_por_oferta(Dni, IdOferta, ListaPuntajes) :-
    findall(P, (
        oferta_actividad(IdOferta, IdAct, NivelReq),
        ( persona_actividad(Dni, IdAct, NivelPersona, Anios)
          -> puntaje_actividad(NivelPersona, Anios, NivelReq, P)
          ;  P = 0
        )
    ), ListaPuntajes).

suma_lista([], 0).
suma_lista([H|T], S) :- suma_lista(T, R), S is H + R.

% Normalización CORREGIDA
normalizar_puntaje(Suma, NReq, Score) :-
    ( NReq =:= 0 -> Score = 0
    ; MaxPosible is 100 * NReq,  % Puntaje maximo mas realista
      Score is (Suma / MaxPosible) * 100  % Convertir a porcentaje
    ).

contar_requisitos(IdOferta, N) :-
    findall(IdAct, oferta_actividad(IdOferta, IdAct, _), L),
    length(L, N).

oferta_activa(IdOferta) :-
    oferta(IdOferta, _, _, true).

recomendacion(Dni, IdOferta, Score) :-
    oferta_activa(IdOferta),
    contar_requisitos(IdOferta, NReq),
    puntajes_parciales_por_oferta(Dni, IdOferta, Lista),
    suma_lista(Lista, Suma),
    normalizar_puntaje(Suma, NReq, Score),
    Score > 0.

recomendaciones_top(Dni, K, Resultado) :-
    findall([Score, IdOferta], recomendacion(Dni, IdOferta, Score), Pairs),
    sort(0, @>=, Pairs, Sorted),
    take_k(Sorted, K, Resultado).

take_k(_, 0, []) :- !.
take_k([], _, []) :- !.
take_k([[Score, IdOferta]|T], K, [[Score, IdOferta]|R]) :-
    K1 is K - 1,
    take_k(T, K1, R).