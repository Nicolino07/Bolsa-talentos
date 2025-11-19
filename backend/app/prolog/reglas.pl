
% =============================================
% CONFIGURACIÓN DE UMBRALES (VARIABLES GLOBALES)
% =============================================

% UMBRAL_MINIMO_NIVEL: Nivel minimo de habilidad para generar recomendaciones
% 1 = Principiante, 2 = Intermedio, 3 = Avanzado, 4 = Experto
:- dynamic umbral_minimo_nivel/1.
umbral_minimo_nivel(1).  % Incluye desde Principiante

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% UMBRAL_MINIMO_CONFIANZA: Confianza minima para mostrar recomendaciones
% 0.0 a 1.0 (0% a 100%)
:- dynamic umbral_minimo_confianza/1.
umbral_minimo_confianza(0.15).  % 15% de confianza minima

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% FACTOR_ATENUACION: Reduce la confianza base de las relaciones
% Para ser mas conservadores en las recomendaciones
:- dynamic factor_atenuacion/1.
factor_atenuacion(0.9).  % Reduce 10% la confianza original


% =============================================
% REGLAS PRINCIPALES DE MATCHING (EXISTENTES)
% =============================================

% "constantes"
nivel_valor("principiante", 1).
nivel_valor("intermedio", 2).
nivel_valor("avanzado", 3).
nivel_valor("experto", 4).

% Cálculo de puntaje
puntaje_actividad(NivelPersona, Anios, NivelReq, Puntaje) :-
    nivel_valor(NivelPersona, VP),
    nivel_valor(NivelReq, VR),
    VP >= VR,
    Puntaje is (VP * 20) + (Anios * 5).

puntaje_actividad(NivelPersona, _, NivelReq, 0) :-
    nivel_valor(NivelPersona, VP),
    nivel_valor(NivelReq, VR),
    VP < VR.

% Sistema de recomendaciones principal
recomendacion(Dni, IdOferta, Score) :-
    oferta_activa(IdOferta),
    contar_requisitos(IdOferta, NReq),
    puntajes_parciales_por_oferta(Dni, IdOferta, Lista),
    suma_lista(Lista, Suma),
    normalizar_puntaje(Suma, NReq, Score),
    Score > 0.

% =============================================
% SISTEMA DE APRENDIZAJE AUTOMÁTICO
% =============================================

% Aprender relaciones de co-ocurrencia
aprender_co_ocurrencia :-
    format(user_error, "🎓 Aprendiendo co-ocurrencias...~n", []),
    
    % Limpiar relaciones anteriores
    retractall(relacion_co_ocurrencia(_, _, _, _)),
    
    % Encontrar todas las combinaciones de habilidades por persona
    findall([H1, H2, DNI], (
        persona_actividad(DNI, IdAct1, _, _),
        persona_actividad(DNI, IdAct2, _, _),
        IdAct1 \= IdAct2,
        actividad(IdAct1, H1, _, _, _),
        actividad(IdAct2, H2, _, _, _)
    ), TodosPares),
    
    % Procesar frecuencias
    procesar_frecuencias_co_ocurrencia(TodosPares, Frecuencias),
    
    % Guardar relaciones aprendidas
    forall(member([H1, H2, Frec, Conf], Frecuencias), (
        assertz(relacion_co_ocurrencia(H1, H2, Conf, Frec))
    )),
    
    length(Frecuencias, Total),
    format(user_error, "✅ Co-ocurrencias aprendidas: ~d relaciones~n", [Total]).

% Procesar frecuencias y calcular confianzas
procesar_frecuencias_co_ocurrencia(Pares, Resultados) :-
    findall([H1, H2, Frec], (
        member([H1, H2, _], Pares),
        count_occurrences(Pares, [H1, H2, _], Frec)
    ), FrecuenciasCrudas),
    
    sort(FrecuenciasCrudas, FrecuenciasUnicas),
    
    findall([H1, H2, Frec, Conf], (
        member([H1, H2, Frec], FrecuenciasUnicas),
        Frec >= 1,
        calcular_confianza_co_ocurrencia(H1, Frec, Conf)
    ), Resultados).

calcular_confianza_co_ocurrencia(Habilidad, Frecuencia, Confianza) :-
    findall(DNI, (
        persona_actividad(DNI, IdAct, _, _),
        actividad(IdAct, Habilidad, _, _, _)
    ), PersonasConHabilidad),
    length(PersonasConHabilidad, TotalPersonas),
    
    (TotalPersonas > 0 ->
        Confianza is min(0.95, Frecuencia / TotalPersonas)
    ; Confianza = 0.5).

% =============================================
% BÚSQUEDA SEMÁNTICA
% =============================================

buscar_semantica(Consulta, Resultados) :-
    downcase_atom(Consulta, ConsultaLower),
    
    findall([PuntajeTotal, IdAct, Nombre, Area], (
        actividad(IdAct, Nombre, Area, Especialidad, _),
        calcular_relevancia_semantica(ConsultaLower, Nombre, Area, Especialidad, PuntajeTotal),
        PuntajeTotal > 0.1
    ), Todos),
    
    sort(0, @>=, Todos, Ordenados),
    take_k(Ordenados, 20, Resultados).

calcular_relevancia_semantica(Consulta, Nombre, Area, Especialidad, PuntajeTotal) :-
    calcular_similitud_texto(Consulta, Nombre, PNombre),
    (Area \= '' -> calcular_similitud_texto(Consulta, Area, PArea); PArea = 0),
    (Especialidad \= '' -> calcular_similitud_texto(Consulta, Especialidad, PEsp); PEsp = 0),
    encontrar_mejor_relacion_aprendida(Consulta, Nombre, PRel),
    PuntajeTotal is (PNombre * 0.5 + PArea * 0.25 + PEsp * 0.15 + PRel * 0.1).

encontrar_mejor_relacion_aprendida(Consulta, NombreActividad, MejorConfianza) :-
    findall(Conf, (
        (relacion_co_ocurrencia(Consulta, NombreActividad, Conf, _);
         relacion_co_ocurrencia(NombreActividad, Consulta, Conf, _))
    ), Confianzas),
    (Confianzas = [] -> MejorConfianza = 0; max_list(Confianzas, MejorConfianza)).

% =============================================
% RECOMENDACIONES INTELIGENTES
% =============================================

recomendaciones_habilidades(DNI, Recomendaciones) :-
    findall([Confianza, Habilidad, Razon], (
        recomendacion_habilidad_inteligente(DNI, Habilidad, Confianza, Razon),

        umbral_minimo_confianza(UmbralConfianza),
        Confianza >= UmbralConfianza
        
    ), Todas),
    sort(0, @>=, Todas, Ordenadas),
    take_k(Ordenadas, 10, Recomendaciones).

recomendacion_habilidad_inteligente(DNI, Habilidad, Confianza, co_ocurrencia) :-
    persona_actividad(DNI, IdActBase, NivelBase, _),
    nivel_valor(NivelBase, ValorBase),

    %% cuidado con este valor de restricion
    umbral_minimo_nivel(UmbralNivel),
    ValorBase >= UmbralNivel,

    actividad(IdActBase, HabilidadBase, _, _, _),
    relacion_co_ocurrencia(HabilidadBase, Habilidad, ConfianzaBase, _),
    \+ (persona_actividad(DNI, IdAct, _, _), actividad(IdAct, Habilidad, _, _, _)),
    Confianza is ConfianzaBase * 0.9.

% =============================================
% PREDICADOS DE APOYO
% =============================================

count_occurrences(List, Element, Count) :-
    findall(1, member(Element, List), Occurrences),
    length(Occurrences, Count).

suma_lista([], 0).
suma_lista([H|T], S) :- suma_lista(T, R), S is H + R.

normalizar_puntaje(Suma, NReq, Score) :-
    ( NReq =:= 0 -> Score = 0
    ; MaxPosible is 100 * NReq,
      Score is (Suma / MaxPosible) * 100
    ).

contar_requisitos(IdOferta, N) :-
    findall(IdAct, oferta_actividad(IdOferta, IdAct, _), L),
    length(L, N).

oferta_activa(IdOferta) :-
    oferta(IdOferta, _, _, true).

puntajes_parciales_por_oferta(Dni, IdOferta, ListaPuntajes) :-
    findall(P, (
        oferta_actividad(IdOferta, IdAct, NivelReq),
        ( persona_actividad(Dni, IdAct, NivelPersona, Anios)
          -> puntaje_actividad(NivelPersona, Anios, NivelReq, P)
          ;  P = 0
        )
    ), ListaPuntajes).

take_k(_, 0, []) :- !.
take_k([], _, []) :- !.
take_k([H|T], K, [H|R]) :-
    K1 is K - 1,
    take_k(T, K1, R).

calcular_similitud_texto(Texto1, Texto2, Similitud) :-
    downcase_atom(Texto1, T1),
    downcase_atom(Texto2, T2),
    (   T1 == T2 -> Similitud = 1.0
    ;   sub_atom(T2, _, _, _, T1) -> Similitud = 0.8
    ;   sub_atom(T1, _, _, _, T2) -> Similitud = 0.8
    ;   palabras_comunes(T1, T2, Comun, Total),
        (Total > 0 -> Similitud is Comun / Total; Similitud = 0.1)
    ).

palabras_comunes(T1, T2, Comun, Total) :-
    atomic_list_concat(Palabras1, ' ', T1),
    atomic_list_concat(Palabras2, ' ', T2),
    intersection(Palabras1, Palabras2, PalabrasComunes),
    length(PalabrasComunes, Comun),
    length(Palabras1, Total1),
    length(Palabras2, Total2),
    Total is max(Total1, Total2).