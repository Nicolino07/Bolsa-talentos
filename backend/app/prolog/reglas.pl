% REGLAS DE MATCHING EN TIEMPO REAL

% 1. MATCHING POR HABILIDAD EXACTA
match_habilidad_exacta(PersonaID, EmpresaID, Actividad, Score) :-
    persona_actividad(PersonaID, _, _, ActividadID, Actividad, NivelPersona, ExpPersona),
    empresa_necesidad(EmpresaID, _, _, ActividadID, Actividad, NivelRequerido),
    cumple_nivel(NivelPersona, NivelRequerido),
    calcular_score_habilidad(NivelPersona, ExpPersona, NivelRequerido, Score).

% 2. MATCHING POR UBICACIÓN
match_ubicacion(PersonaID, EmpresaID, Actividad, Score) :-
    persona_actividad(PersonaID, CiudadPersona, ProvinciaPersona, ActividadID, Actividad, NivelPersona, _),
    empresa_necesidad(EmpresaID, CiudadEmpresa, ProvinciaEmpresa, ActividadID, Actividad, NivelRequerido),
    cumple_nivel(NivelPersona, NivelRequerido),
    calcular_score_ubicacion(CiudadPersona, ProvinciaPersona, CiudadEmpresa, ProvinciaEmpresa, ScoreUbicacion),
    Score is ScoreUbicacion * 0.7.  % Peso menor que habilidades

% 3. MATCHING POR SKILLS RELACIONADOS
match_skills_relacionados(PersonaID, EmpresaID, ActividadRequerida, Score) :-
    empresa_necesidad(EmpresaID, _, _, ActividadID, ActividadRequerida, NivelRequerido),
    actividad_relacionada(ActividadID, ActividadRelacionadaID),
    persona_actividad(PersonaID, _, _, ActividadRelacionadaID, ActividadRelacionada, NivelPersona, ExpPersona),
    cumple_nivel(NivelPersona, NivelRequerido),
    calcular_score_transferible(ActividadRequerida, ActividadRelacionada, Score).

% 4. MATCHING COMPUESTO (HABILIDAD + UBICACIÓN)
match_compuesto(PersonaID, EmpresaID, Actividad, ScoreTotal) :-
    match_habilidad_exacta(PersonaID, EmpresaID, Actividad, ScoreHabilidad),
    persona_actividad(PersonaID, CiudadP, ProvP, _, _, _, _),
    empresa_necesidad(EmpresaID, CiudadE, ProvE, _, _, _),
    calcular_score_ubicacion(CiudadP, ProvP, CiudadE, ProvE, ScoreUbicacion),
    ScoreTotal is (ScoreHabilidad * 0.7) + (ScoreUbicacion * 0.3).

% 5. MATCHING PARA MULTIPLES HABILIDADES
match_multi_habilidad(PersonaID, EmpresaID, ScoreTotal) :-
    findall(Score, (
        empresa_necesidad(EmpresaID, _, _, ActividadID, Actividad, NivelRequerido),
        persona_actividad(PersonaID, _, _, ActividadID, Actividad, NivelPersona, ExpPersona),
        cumple_nivel(NivelPersona, NivelRequerido),
        calcular_score_habilidad(NivelPersona, ExpPersona, NivelRequerido, Score)
    ), Scores),
    sum_list(Scores, ScoreTotal).

% REGLAS AUXILIARES
cumple_nivel(NivelPersona, NivelRequerido) :-
    nivel_valor(NivelPersona, ValP),
    nivel_valor(NivelRequerido, ValR),
    ValP >= ValR.

nivel_valor('PRINCIPIANTE', 1).
nivel_valor('INTERMEDIO', 2).
nivel_valor('AVANZADO', 3).
nivel_valor('EXPERTO', 4).

calcular_score_habilidad(NivelPersona, ExpPersona, NivelRequerido, Score) :-
    nivel_valor(NivelPersona, ValP),
    nivel_valor(NivelRequerido, ValR),
    BaseScore is ValP * 20,
    ExpBonus is min(ExpPersona * 2, 30),  % Máximo 30 puntos por experiencia
    Score is BaseScore + ExpBonus.

calcular_score_ubicacion(CiudadP, ProvP, CiudadE, ProvE, 100) :- CiudadP = CiudadE.
calcular_score_ubicacion(CiudadP, ProvP, CiudadE, ProvE, 80) :- ProvP = ProvE, CiudadP \= CiudadE.
calcular_score_ubicacion(CiudadP, ProvP, CiudadE, ProvE, 50) :- ProvP \= ProvE.

% Definición de habilidades relacionadas (ejemplo)
actividad_relacionada(1, 2).  % Python -> JavaScript
actividad_relacionada(2, 1).  % JavaScript -> Python
actividad_relacionada(6, 7).  % Tecnología Alimentos -> Producción Agrícola

calcular_score_transferible(ActividadReq, ActividadRel, Score) :-
    % Lógica para calcular score de skills transferibles
    Score = 60.  % Score base para skills relacionados