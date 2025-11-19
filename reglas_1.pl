% 
% REGLAS PRINCIPALES DE MATCHING 
%
% "constantes"
nivel_valor("principiante", 1).
nivel_valor("intermedio", 2).
nivel_valor("avanzado", 3).
nivel_valor("experto", 4).


% Fórmula, mas valor para el nivel de aprendizaje(*20) y menos para los años de experiencia(*5)
% Ej: intermedio(2) + 4 años = 40 + 20 = 60
% Cálculo de puntaje
puntaje_actividad(NivelPersona, Anios, NivelReq, Puntaje) :-
    nivel_valor(NivelPersona, VP),
    nivel_valor(NivelReq, VR),
    VP >= VR,
    Puntaje is (VP * 20) + (Anios * 5).


% 0 puntos si se tiene menos nivel del especificado
puntaje_actividad(NivelPersona, _, NivelReq, 0) :-
    nivel_valor(NivelPersona, VP),
    nivel_valor(NivelReq, VR),
    VP < VR.



puntajes_parciales_por_oferta(Dni, IdOferta, ListaPuntajes) :-
    findall(P, (
        oferta_actividad(IdOferta, IdAct, NivelReq), % Encuentra todos los requisitos de la oferta
        ( persona_actividad(Dni, IdAct, NivelPersona, Anios) % Verifica si la persona tiene esa actividad
          -> puntaje_actividad(NivelPersona, Anios, NivelReq, P)
          ;  P = 0 % Si la tiene, calcula el puntaje (P), si no P=0
        )
    ), ListaPuntajes). % Recolecta todos los puntajes (P) en ListaPuntajes

% suma todos los puntajes=
suma_lista([], 0).
suma_lista([H|T], S) :- suma_lista(T, R), S is H + R.


% Normalización = Convierte la suma de los puntajes obtenidos en un porcentaje de ajuste (Score).
normalizar_puntaje(Suma, NReq, Score) :-
    ( NReq =:= 0 -> Score = 0
    ; MaxPosible is 100 * NReq,  % Puntaje maximo mas realista
      Score is (Suma / MaxPosible) * 100  % Convertir a porcentaje
    ).

% Cuenta cuantas actividades requiere una oferta
contar_requisitos(IdOferta, N) :-
    findall(IdAct, oferta_actividad(IdOferta, IdAct, _), L),
    length(L, N).

% Verifica si la oferta está marcada como activa
oferta_activa(IdOferta) :-
    oferta(IdOferta, _, _, true).

% Solo recomienda si el Score es mayor a cero.
recomendacion(Dni, IdOferta, Score) :-
    oferta_activa(IdOferta),
    contar_requisitos(IdOferta, NReq),
    puntajes_parciales_por_oferta(Dni, IdOferta, Lista),
    suma_lista(Lista, Suma),
    normalizar_puntaje(Suma, NReq, Score),
    Score > 0.

% Este predicado ejecuta la recomendación para todas las ofertas activas, las clasifica y devuelve las K mejores
recomendaciones_top(Dni, K, Resultado) :-
    findall([Score, IdOferta], recomendacion(Dni, IdOferta, Score), Pairs),
    sort(0, @>=, Pairs, Sorted),
    take_k(Sorted, K, Resultado).


% Toma los primeros K elementos de la lista ordenada, generando la lista final de resultados.
take_k(_, 0, []) :- !.
take_k([], _, []) :- !.
take_k([[Score, IdOferta]|T], K, [[Score, IdOferta]|R]) :-
    K1 is K - 1,
    take_k(T, K1, R).