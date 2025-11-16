% rutas basicas y reglas (usá la versión que prefieras)
% ... suponemos que existe score_total(DNI, IdOferta, BestScore).

nivel_valor('PRINCIPIANTE', 1).
nivel_valor('INTERMEDIO', 2).
nivel_valor('AVANZADO', 3).
nivel_valor('EXPERTO', 4).

cumple_nivel(NP, NR) :-
    nivel_valor(NP, Vp), nivel_valor(NR, Vr), Vp >= Vr.

calcular_score_habilidad(NivelPersona, Anos, _NivelReq, Score) :-
    nivel_valor(NivelPersona, Vp),
    Base is Vp * 20,
    ExpBonus is min(Anos * 2, 30),
    Score is Base + ExpBonus.

calcular_score_ubicacion(CP, PP, CE, PE, 100) :- CP = CE.
calcular_score_ubicacion(_, PP, _, PE, 80) :- PP = PE.
calcular_score_ubicacion(_, _, _, _, 50).

% match_habilidad_exacta usando oferta_actividad y persona_actividad
match_habilidad_exacta(DNI, IdOferta, IdActividad, Score) :-
    persona_actividad(DNI, IdActividad, NivelPersona, Anos),
    oferta_actividad(IdOferta, IdActividad, NivelReq),
    cumple_nivel(NivelPersona, NivelReq),
    calcular_score_habilidad(NivelPersona, Anos, NivelReq, Score).

% match_multi_habilidad: suma scores de todas las actividades requeridas por la oferta
match_multi_habilidad(DNI, IdOferta, Total) :-
    findall(S, (
        oferta_actividad(IdOferta, IdAct, NivelReq),
        persona_actividad(DNI, IdAct, NivelPersona, Anos),
        cumple_nivel(NivelPersona, NivelReq),
        calcular_score_habilidad(NivelPersona, Anos, NivelReq, S)
    ), Scores),
    (Scores = [] -> Total = 0 ; sum_list(Scores, Total)).

% score_total: combina multi-habilidades y ubicación (ej: 80% habilidades, 20% ubicación)
score_total(DNI, IdOferta, TotalScore) :-
    match_multi_habilidad(DNI, IdOferta, Sskills),
    persona(DNI, CiudadP, ProvP),
    oferta_empleo(IdOferta, IdEmpresa, _, _, _, _, _),
    empresa(IdEmpresa, _, CiudadE, ProvE, _, _, _, _),
    calcular_score_ubicacion(CiudadP, ProvP, CiudadE, ProvE, Sloc0),
    Sloc is Sloc0 * 0.2,
    TotalScore is Sskills * 0.8 + Sloc.