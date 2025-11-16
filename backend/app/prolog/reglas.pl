% reglas.pl - Versión básica para pruebas
% Sin recursión infinita, solo reglas simples

:- encoding(utf8).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%                       REGLAS BÁSICAS DE CONFIGURACIÓN                 %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Valores numéricos para niveles de habilidad
nivel_valor('PRINCIPIANTE', 1).
nivel_valor('INTERMEDIO', 2).
nivel_valor('AVANZADO', 3).
nivel_valor('EXPERTO', 4).

% Datos de demostración para pruebas
persona_demo(30567890, 'Ana García', 5).
persona_demo(28765432, 'Carlos López', 3).
persona_demo(33445566, 'María Rodríguez', 4).

tiene_habilidad_demo(30567890, 'Python', 'AVANZADO', 4).
tiene_habilidad_demo(30567890, 'SQL', 'INTERMEDIO', 3).
tiene_habilidad_demo(28765432, 'JavaScript', 'AVANZADO', 5).
tiene_habilidad_demo(33445566, 'Python', 'INTERMEDIO', 3).

oferta_demo(1, 'Desarrollador Python', 3).
oferta_demo(2, 'Desarrollador FullStack', 4).

requiere_habilidad_demo(1, 'Python', 'INTERMEDIO').
requiere_habilidad_demo(2, 'JavaScript', 'AVANZADO').

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%                       REGLAS SIMPLES DE MATCHING                      %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Regla simple: persona tiene la experiencia mínima para la oferta
puede_aplicar(DNI, OfertaID) :-
    persona_demo(DNI, _, ExpPersona),
    oferta_demo(OfertaID, _, ExpRequerida),
    ExpPersona >= ExpRequerida.

% Regla simple: persona tiene habilidades requeridas
tiene_habilidades_requeridas(DNI, OfertaID) :-
    requiere_habilidad_demo(OfertaID, HabilidadReq, _),
    tiene_habilidad_demo(DNI, HabilidadReq, _, _).

% Matching básico: recomendar si puede aplicar y tiene habilidades
recomendacion_basica(DNI, OfertaID) :-
    puede_aplicar(DNI, OfertaID),
    tiene_habilidades_requeridas(DNI, OfertaID).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%                       REGLAS DE BÚSQUEDA SIMPLES                     %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Buscar personas por habilidad
buscar_personas_habilidad(Habilidad, DNI, Nombre, Nivel) :-
    tiene_habilidad_demo(DNI, Habilidad, Nivel, _),
    persona_demo(DNI, Nombre, _).

% Buscar ofertas por habilidad requerida
buscar_ofertas_habilidad(Habilidad, OfertaID, Titulo) :-
    requiere_habilidad_demo(OfertaID, Habilidad, _),
    oferta_demo(OfertaID, Titulo, _).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%                       REGLAS DE COMPATIBILIDAD SIMPLE                %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Compatibilidad simple basada en nivel
compatibilidad_nivel(NivelPersona, NivelRequerido, Puntaje) :-
    nivel_valor(NivelPersona, ValPersona),
    nivel_valor(NivelRequerido, ValRequerido),
    (ValPersona >= ValRequerido -> Puntaje is 100 ; Puntaje is 50).

% Matching con puntaje
matching_con_puntaje(DNI, OfertaID, Puntaje) :-
    persona_demo(DNI, _, ExpP),
    oferta_demo(OfertaID, _, ExpR),
    ExpP >= ExpR,
    findall(PuntajeH,
        (requiere_habilidad_demo(OfertaID, Habilidad, NivelReq),
         tiene_habilidad_demo(DNI, Habilidad, NivelPers, _),
         compatibilidad_nivel(NivelPers, NivelReq, PuntajeH)),
        Puntajes),
    length(Puntajes, Cant),
    (Cant > 0 -> Puntaje is 60 + (Cant * 10) ; Puntaje is 0).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%                            MENSAJE DE INICIO                          %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

:- write('🎯 Sistema de Matching BÁSICO cargado!'), nl.
:- write('📚 Reglas disponibles:'), nl.
:- write('   - recomendacion_basica/2'), nl.
:- write('   - buscar_personas_habilidad/4'), nl.
:- write('   - buscar_ofertas_habilidad/3'), nl.
:- write('   - matching_con_puntaje/3'), nl.