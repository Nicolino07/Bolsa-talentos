:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_files)).
:- use_module(library(http/http_parameters)).
:- use_module(library(http/http_multipart_plugin)).

:- dynamic persona/5.
:- dynamic persona_actividad/4.
:- dynamic oferta/4.
:- dynamic oferta_actividad/3.

:- consult('reglas.pl').


% -----------------------------
% ENDPOINT: STATUS
% -----------------------------
:- http_handler(root(status), handle_status, []).

handle_status(_Req) :-
    reply_json_dict(_{status:"ok", service:"prolog-engine"}).


% -----------------------------
% ENDPOINT: RELOAD HECHOS
% -----------------------------
:- http_handler(root(reload_hechos), handle_reload_hechos, []).

handle_reload_hechos(_Request) :-
    recargar_hechos,
    reply_json_dict(_{status:"ok", reloaded:true}).


% -----------------------------
% ENDPOINT: UPLOAD
% -----------------------------
:- http_handler(root(upload_hechos), handle_upload_hechos, []).

handle_upload_hechos(Request) :-
    format(user_error, "🔄 Iniciando upload_hechos~n", []),
    
    % Leer datos multipart
    http_read_multipart_form_data(Request, Parts),
    format(user_error, "📦 Partes recibidas: ~d~n", [length(Parts)]),
    
    % Mostrar info de cada parte
    forall(member(Part, Parts), (
        get_dict(name, Part, Name),
        (get_dict(data, Part, Data) -> 
            Size = atom_length(Data),
            format(user_error, "   Parte: ~w, tamaño: ~d bytes~n", [Name, Size])
        ; 
            format(user_error, "   Parte: ~w, sin datos~n", [Name])
        )
    )),
    
    % Extraer contenido
    (   member(part{name: hechos, data: HechosContent}, Parts)
    ->  format(user_error, "✅ Encontrada parte 'hechos'~n", [])
    ;   format(user_error, "❌ ERROR: No se encontró parte 'hechos'~n", []),
        reply_json_dict(_{status:"error", message:"Missing 'hechos' part"}),
        !
    ),
    
    (   member(part{name: ofertas, data: OfertasContent}, Parts)
    ->  format(user_error, "✅ Encontrada parte 'ofertas'~n", [])
    ;   format(user_error, "❌ ERROR: No se encontró parte 'ofertas'~n", []),
        reply_json_dict(_{status:"error", message:"Missing 'ofertas' part"}),
        !
    ),
    
    % Guardar archivos
    guardar_archivo_hechos(HechosContent),
    guardar_archivo_ofertas(OfertasContent),
    
    % Recargar hechos
    format(user_error, "🔄 Recargando hechos...~n", []),
    recargar_hechos,
    
    format(user_error, "✅ Upload completado exitosamente~n", []),
    reply_json_dict(_{status:"ok", uploaded:true}).


% -----------------------------
% ENDPOINT: MATCHING - CON CARGA AUTOMÁTICA
% -----------------------------
:- http_handler(root(matching), handle_matching, []).

handle_matching(Request) :-
    http_parameters(Request, [dni(DniAtom, [])]),
    atom_number(DniAtom, DNI),
    
    % Verificar si hay datos cargados, si no, intentar cargar archivos
    (   (persona(DNI, _, _, _, _); persona_actividad(DNI, _, _, _))
    ->  format(user_error, "✅ Datos ya cargados para DNI ~w~n", [DNI])
    ;   format(user_error, "🔄 No hay datos cargados, intentando cargar archivos...~n", []),
        recargar_hechos
    ),
    
    findall(
        _{oferta:ID, titulo:T, puntaje:P},
        match(DNI, ID, T, P),
        Resultados
    ),

    reply_json_dict(_{
        status:"ok",
        dni:DNI,
        recomendaciones:Resultados
    }).


% -----------------------------
% ENDPOINT: VERIFICAR DATOS CARGADOS
% -----------------------------
:- http_handler(root(datos_cargados), handle_datos_cargados, []).

handle_datos_cargados(_Request) :-
    findall(DNI, persona(DNI, _, _, _, _), Personas),
    findall(ID, oferta(ID, _, _, _), Ofertas),
    length(Personas, CantPersonas),
    length(Ofertas, CantOfertas),
    
    reply_json_dict(_{
        status: "ok",
        personas_cargadas: CantPersonas,
        ofertas_cargadas: CantOfertas,
        personas: Personas,
        ofertas: Ofertas
    }).


% -----------------------------
% HELPERS PARA GUARDAR ARCHIVOS
% -----------------------------
guardar_archivo_hechos(Contenido) :-
    format(user_error, "💾 Guardando hechos.pl...~n", []),
    setup_call_cleanup(
        open('/app/data/hechos.pl', write, HStream),
        format(HStream, "~s", [Contenido]),
        close(HStream)
    ),
    format(user_error, "✅ hechos.pl guardado~n", []).

guardar_archivo_ofertas(Contenido) :-
    format(user_error, "💾 Guardando ofertas.pl...~n", []),
    setup_call_cleanup(
        open('/app/data/ofertas.pl', write, OStream),
        format(OStream, "~s", [Contenido]),
        close(OStream)
    ),
    format(user_error, "✅ ofertas.pl guardado~n", []).


% -----------------------------
% RECARGA DE HECHOS
% -----------------------------
recargar_hechos :-
    format(user_error, "🗑️  Eliminando predicados existentes~n", []),
    retractall(persona(_,_,_,_,_)),
    retractall(persona_actividad(_,_,_,_)),
    retractall(oferta(_,_,_,_)),
    retractall(ofertas_actividad(_,_,_)),
    
    format(user_error, "📥 Intentando cargar hechos.pl...~n", []),
    (   exists_file('/app/data/hechos.pl')
    ->  (   catch(consult('/app/data/hechos.pl'), Error1, 
            (format(user_error, "❌ Error cargando hechos.pl: ~w~n", [Error1]), fail))
        ->  format(user_error, "✅ hechos.pl cargado exitosamente~n", [])
        ;   format(user_error, "⚠️  No se pudo cargar hechos.pl~n", [])
        )
    ;   format(user_error, "📭 hechos.pl no existe~n", [])
    ),
    
    format(user_error, "📥 Intentando cargar ofertas.pl...~n", []),
    (   exists_file('/app/data/ofertas.pl')
    ->  (   catch(consult('/app/data/ofertas.pl'), Error2, 
            (format(user_error, "❌ Error cargando ofertas.pl: ~w~n", [Error2]), fail))
        ->  format(user_error, "✅ ofertas.pl cargado exitosamente~n", [])
        ;   format(user_error, "⚠️  No se pudo cargar ofertas.pl~n", [])
        )
    ;   format(user_error, "📭 ofertas.pl no existe~n", [])
    ),
    
    % Mostrar resumen de datos cargados
    findall(_, persona(_,_,_,_,_), Personas),
    findall(_, oferta(_,_,_,_), Ofertas),
    length(Personas, CantPersonas),
    length(Ofertas, CantOfertas),
    format(user_error, "📊 Resumen: ~d personas, ~d ofertas cargadas~n", [CantPersonas, CantOfertas]),
    
    format(user_error, "✅ Recarga completada~n", []).


% -----------------------------
% MATCH
% -----------------------------
match(DNI, ID_Oferta, Titulo, Puntaje) :-
    recomendacion(DNI, ID_Oferta, Puntaje),
    oferta(ID_Oferta, _, Titulo, true).   % solo ofertas activas


% -----------------------------
% SERVER
% -----------------------------
start_server :-
    % Solo cargar si existen archivos, sin fallar si no
    recargar_hechos,
    
    % Iniciar servidor
    http_server(http_dispatch, [port(4000)]),
    format("Servidor Prolog iniciado en puerto 4000~n"),
    thread_get_message(_).

:- initialization(start_server, main).


% -----------------------------
% ENDPOINT: BUSCAR POR HABILIDADES
% -----------------------------
:- http_handler(root(buscar_por_habilidades), handle_buscar_por_habilidades, []).

handle_buscar_por_habilidades(Request) :-
    http_parameters(Request, [
        actividades(ActividadesAtom, []),
        nivel_minimo(NivelMinAtom, [])
    ]),
    
    % Convertir string de actividades a lista [1,2,3]
    atom_to_term(ActividadesAtom, ActividadesList, _),
    atom_to_term(NivelMinAtom, NivelMin, _),
    
    findall(
        _{dni:DNI, nombre:Nombre, apellido:Apellido, ciudad:Ciudad, puntaje_total:Puntaje},
        candidato_por_habilidades(ActividadesList, NivelMin, DNI, Nombre, Apellido, Ciudad, Puntaje),
        Resultados
    ),

    reply_json_dict(_{
        status:"ok",
        actividades:ActividadesList,
        nivel_minimo:NivelMin,
        candidatos:Resultados
    }).

% Regla para encontrar candidatos por habilidades
candidato_por_habilidades(ActividadesRequeridas, NivelMin, DNI, Nombre, Apellido, Ciudad, PuntajeTotal) :-
    persona(DNI, Nombre, Apellido, Ciudad, _),
    findall(Puntaje, (
        member(ActividadID, ActividadesRequeridas),
        persona_actividad(DNI, ActividadID, Nivel, Anios),
        nivel_valor(Nivel, ValorNivel),
        ValorNivel >= NivelMin,
        Puntaje is ValorNivel * 20 + Anios * 5
    ), Puntajes),
    sum_list(Puntajes, PuntajeTotal),
    PuntajeTotal > 0.

% -----------------------------
% ENDPOINT: BUSCAR POR UBICACIÓN
% -----------------------------
:- http_handler(root(buscar_por_ubicacion), handle_buscar_por_ubicacion, []).

handle_buscar_por_ubicacion(Request) :-
    http_parameters(Request, [
        ciudad(Ciudad, []),
        provincia(Provincia, [])
    ]),
    
    findall(
        _{dni:DNI, nombre:Nombre, apellido:Apellido, ciudad:CiudadPersona, provincia:ProvinciaPersona},
        persona(DNI, Nombre, Apellido, CiudadPersona, ProvinciaPersona),
        TodasPersonas
    ),
    
    % Filtrar por ciudad y/o provincia
    (   Ciudad \= ''
    ->  include([P]>>get_dict(ciudad, P, CiudadF), TodasPersonas, Filtrado1)
    ;   Filtrado1 = TodasPersonas
    ),
    
    (   Provincia \= ''
    ->  include([P]>>get_dict(provincia, P, ProvinciaF), Filtrado1, Resultados)
    ;   Resultados = Filtrado1
    ),

    reply_json_dict(_{
        status:"ok",
        ciudad:Ciudad,
        provincia:Provincia,
        candidatos:Resultados
    }).

% -----------------------------
% ENDPOINT: OFERTAS POR EMPRESA
% -----------------------------
:- http_handler(root(ofertas_por_empresa), handle_ofertas_por_empresa, []).

handle_ofertas_por_empresa(Request) :-
    http_parameters(Request, [
        id_empresa(EmpresaIDAtom, [])
    ]),
    atom_number(EmpresaIDAtom, EmpresaID),
    
    findall(
        _{id:ID, titulo:Titulo, descripcion:Desc, activa:Activa},
        oferta(ID, EmpresaID, Titulo, Activa),
        Ofertas
    ),

    reply_json_dict(_{
        status:"ok",
        id_empresa:EmpresaID,
        ofertas:Ofertas
    }).

% -----------------------------
% ENDPOINT: MATCHING AVANZADO
% -----------------------------
:- http_handler(root(matching_avanzado), handle_matching_avanzado, []).

handle_matching_avanzado(Request) :-
    http_parameters(Request, [
        dni(DniAtom, []),
        id_oferta(OfertaIDAtom, [])
    ]),
    atom_number(DniAtom, DNI),
    atom_number(OfertaIDAtom, OfertaID),
    
    (   recomendacion(DNI, OfertaID, Puntaje)
    ->  oferta(OfertaID, _, Titulo, _),
        persona(DNI, Nombre, Apellido, _, _),
        reply_json_dict(_{
            status:"ok",
            match: true,
            dni:DNI,
            nombre:Nombre,
            apellido:Apellido,
            oferta:OfertaID,
            titulo:Titulo,
            puntaje:Puntaje
        })
    ;   reply_json_dict(_{
            status:"ok", 
            match: false,
            dni:DNI,
            oferta:OfertaID,
            puntaje:0
        })
    ).

