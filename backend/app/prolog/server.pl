:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_files)).
:- use_module(library(http/http_parameters)).
:- use_module(library(http/http_multipart_plugin)).
:- use_module(library(lists)).


:- dynamic persona/5.
:- dynamic persona_actividad/4.
:- dynamic oferta/4.
:- dynamic oferta_actividad/3.
:- dynamic actividad/5.
:- dynamic empresa/5.
:- dynamic empresa_actividad/3.
:- dynamic relacion_co_ocurrencia/4.
:- dynamic postulacion/3.


% -----------------------------
% VERIFICACIÓN DE DATOS MÍNIMOS
% -----------------------------
datos_suficientes_cargados :-
    findall(_, persona(_, _, _, _, _), Personas),
    findall(_, actividad(_, _, _, _, _), Actividades),
    length(Personas, CantPersonas),
    length(Actividades, CantActividades),
    CantPersonas >= 3,  % Mínimo 3 personas
    CantActividades >= 5.  % Mínimo 5 actividades


% -----------------------------
% CORS MIDDLEWARE
% -----------------------------
:- http_handler(root(.), cors_handler, [prefix]).

cors_handler(Request) :-
    http_read_data(Request, Data, [to(string)]),
    format('Access-Control-Allow-Origin: *~n'),
    format('Access-Control-Allow-Methods: GET, POST, OPTIONS~n'),
    format('Access-Control-Allow-Headers: Content-Type~n'),
    (   http_method(Request, options)
    ->  format('~n')  % Responder a preflight OPTIONS
    ;   http_dispatch(Request)  % Procesar request normal
    ).

% CARGA LAS REGLAS PRINCIPALES
:- consult('/app/reglas.pl').

% -----------------------------
% SERVER
% -----------------------------
start_server :-
    % Cargar datos al iniciar (inteligentemente)
    format(user_error, "🚀 Iniciando servidor Prolog...~n", []),
    recargar_hechos,
    
    % Iniciar servidor
    http_server(http_dispatch, [port(4000)]),
    format("🚀 Servidor Prolog iniciado en puerto 4000~n"),
    format("📊 Endpoints disponibles:~n"),
    format("   GET  /status~n"),
    format("   POST /reload_hechos~n"),
    format("   POST /upload_hechos~n"),
    format("   GET  /matching?dni=DNI~n"),
    format("   GET  /datos_cargados~n"),
    format("   GET  /buscar_por_habilidades?actividades=LISTA&nivel_minimo=NIVEL~n"),
    format("   GET  /buscar_por_ubicacion?ciudad=CIUDAD&provincia=PROVINCIA~n"),
    format("   GET  /ofertas_por_empresa?id_empresa=ID~n"),
    format("   GET  /matching_avanzado?dni=DNI&id_oferta=ID~n"),
    format("   POST /aprender~n"),
    format("   GET  /buscar_semantica?consulta=TEXTO~n"),
    format("   GET  /recomendaciones_habilidades?dni=DNI~n"),
    format("   GET  /relaciones_aprendidas~n"),
    thread_get_message(_).

:- initialization(start_server, main).


% -----------------------------
% HELPERS PARA CARGA DE ARCHIVOS
% -----------------------------
cargar_si_existe(Archivo) :-
    (   exists_file(Archivo)
    ->  format(user_error, "📥 Cargando ~w...~n", [Archivo]),
        (   catch(consult(Archivo), Error, 
            (format(user_error, "❌ Error cargando ~w: ~w~n", [Archivo, Error]), fail))
        ->  format(user_error, "✅ ~w cargado exitosamente~n", [Archivo])
        ;   format(user_error, "⚠️  No se pudo cargar ~w~n", [Archivo])
        )
    ;   format(user_error, "📭 ~w no existe~n", [Archivo])
    ).

% -----------------------------
% RECARGA INTELIGENTE DE HECHOS
% -----------------------------
recargar_hechos :-
    format(user_error, "🔄 Actualizando datos...~n", []),
    recargar_hechos_forzado.

recargar_hechos_forzado :-
    format(user_error, "🗑️  Eliminando predicados existentes~n", []),
    retractall(persona(_,_,_,_,_)),
    retractall(persona_actividad(_,_,_,_)),
    retractall(oferta(_,_,_,_)),
    retractall(oferta_actividad(_,_,_)),
    retractall(actividad(_,_,_,_,_)),
    retractall(empresa(_,_,_,_,_)),
    retractall(empresa_actividad(_,_,_)),
    retractall(relacion_co_ocurrencia(_,_,_,_)),
    retractall(postulacion(_,_,_)),
    
    format(user_error, "📥 Cargando archivos de datos...~n", []),
    
    % Cargar todos los archivos disponibles
    cargar_si_existe('/app/data/hechos.pl'),
    cargar_si_existe('/app/data/ofertas.pl'),
    cargar_si_existe('/app/data/relaciones.pl'),
    cargar_si_existe('/app/data/postulaciones.pl'),
    
    % Ejecutar aprendizaje automático si hay datos suficientes
    (   datos_suficientes_cargados
    ->  format(user_error, "🎓 Ejecutando aprendizaje automático...~n", []),
        (   catch(aprender_co_ocurrencia, Error, 
            format(user_error, "❌ Error en aprendizaje: ~w~n", [Error]))
        ->  guardar_relaciones_en_db
        ;   format(user_error, "⚠️  Aprendizaje no disponible en reglas~n", [])
        )
    ;   format(user_error, "📭 Datos insuficientes para aprendizaje~n", [])
    ),
    
    % Mostrar resumen
    contar_datos,
    format(user_error, "✅ Recarga completada~n", []).


% -----------------------------
% CONTAR DATOS CARGADOS
% -----------------------------
contar_datos :-
    findall(_, persona(_,_,_,_,_), Personas),
    findall(_, oferta(_,_,_,_), Ofertas),
    findall(_, actividad(_,_,_,_,_), Actividades),
    findall(_, relacion_co_ocurrencia(_,_,_,_), Relaciones),
    findall(_, postulacion(_,_,_), Postulaciones),
    length(Personas, CantPersonas),
    length(Ofertas, CantOfertas),
    length(Actividades, CantActividades),
    length(Relaciones, CantRelaciones),
    length(Postulaciones, CantPostulaciones),
    format(user_error, "📊 Resumen cargado: ~d personas, ~d ofertas, ~d actividades, ~d relaciones, ~d postulaciones~n", 
           [CantPersonas, CantOfertas, CantActividades, CantRelaciones, CantPostulaciones]).

% -----------------------------
% ENDPOINT: STATUS
% -----------------------------
:- http_handler(root(status), handle_status, []).

handle_status(_Req) :-
    reply_json_dict(_{
        status: "ok", 
        service: "prolog-engine", 
        version: "2.0",
        timestamp: "now"
    }).

% -----------------------------
% ENDPOINT: RELOAD HECHOS
% -----------------------------
:- http_handler(root(reload_hechos), handle_reload_hechos, []).

handle_reload_hechos(_Request) :-
    recargar_hechos,
    reply_json_dict(_{status: "ok", reloaded: true}).

% -----------------------------
% ENDPOINT: UPLOAD HECHOS (MEJORADO)
% -----------------------------
:- http_handler(root(upload_hechos), handle_upload_hechos, [method(post)]).

handle_upload_hechos(Request) :-
    format(user_error, "🔄 Iniciando upload_hechos~n", []),
    
    http_read_data(Request, Data, [to(string)]),
    format(user_error, "📦 Datos recibidos: ~d caracteres~n", [length(Data)]),
    
    % Guardar archivo temporal
    random_file_name('/tmp/hechos_temp_', '.pl', TempFile),
    setup_call_cleanup(
        open(TempFile, write, Stream),
        format(Stream, "~s", [Data]),
        close(Stream)
    ),
    
    format(user_error, "💾 Archivo temporal guardado: ~w~n", [TempFile]),
    
    % Cargar el archivo
    consult(TempFile),
    
    % Guardar en archivo permanente
    setup_call_cleanup(
        open('/app/data/hechos.pl', write, PermStream),
        format(PermStream, "~s", [Data]),
        close(PermStream)
    ),
    
    format(user_error, "✅ Hechos cargados y guardados permanentemente~n", []),
    
    reply_json_dict(_{status: "ok", uploaded: true, size: length(Data)}).

% -----------------------------
% ENDPOINT: MATCHING
% -----------------------------
:- http_handler(root(matching), handle_matching, []).

handle_matching(Request) :-
    http_parameters(Request, [dni(DniAtom, [])]),
    atom_number(DniAtom, DNI),
    
    % SIEMPRE verificar y cargar datos actualizados
    recargar_hechos,
    
    findall(
        _{oferta: ID, titulo: T, puntaje: P},
        match(DNI, ID, T, P),
        Resultados
    ),

    reply_json_dict(_{
        status: "ok",
        dni: DNI,
        recomendaciones: Resultados
    }).

match(DNI, ID_Oferta, Titulo, Puntaje) :-
    recomendacion(DNI, ID_Oferta, Puntaje),
    oferta(ID_Oferta, _, Titulo, true).

% -----------------------------
% ENDPOINT: VERIFICAR DATOS CARGADOS
% -----------------------------
:- http_handler(root(datos_cargados), handle_datos_cargados, []).

handle_datos_cargados(_Request) :-
    findall(DNI, persona(DNI, _, _, _, _), Personas),
    findall(ID, oferta(ID, _, _, _), Ofertas),
    findall(IdAct, actividad(IdAct, _, _, _, _), Actividades),
    length(Personas, CantPersonas),
    length(Ofertas, CantOfertas),
    length(Actividades, CantActividades),
    
    reply_json_dict(_{
        status: "ok",
        personas_cargadas: CantPersonas,
        ofertas_cargadas: CantOfertas,
        actividades_cargadas: CantActividades,
        personas: Personas,
        ofertas: Ofertas
    }).

% -----------------------------
% ENDPOINT: BUSCAR POR HABILIDADES
% -----------------------------
:- http_handler(root(buscar_por_habilidades), handle_buscar_por_habilidades, []).

handle_buscar_por_habilidades(Request) :-
    http_parameters(Request, [
        actividades(ActividadesAtom, []),
        nivel_minimo(NivelMinAtom, [])
    ]),
    
    % SIEMPRE verificar y cargar datos actualizados
    recargar_hechos,
    
    atom_to_term(ActividadesAtom, ActividadesList, _),
    atom_to_term(NivelMinAtom, NivelMin, _),
    
    findall(
        _{dni: DNI, nombre: Nombre, apellido: Apellido, ciudad: Ciudad, puntaje_total: Puntaje},
        candidato_por_habilidades(ActividadesList, NivelMin, DNI, Nombre, Apellido, Ciudad, Puntaje),
        Resultados
    ),

    reply_json_dict(_{
        status: "ok",
        actividades: ActividadesList,
        nivel_minimo: NivelMin,
        candidatos: Resultados
    }).

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
        _{dni: DNI, nombre: Nombre, apellido: Apellido, ciudad: CiudadPersona, provincia: ProvinciaPersona},
        persona(DNI, Nombre, Apellido, CiudadPersona, ProvinciaPersona),
        TodasPersonas
    ),
    
    (   Ciudad \= ''
    ->  include([P]>>get_dict(ciudad, P, CiudadF), TodasPersonas, Filtrado1)
    ;   Filtrado1 = TodasPersonas
    ),
    
    (   Provincia \= ''
    ->  include([P]>>get_dict(provincia, P, ProvinciaF), Filtrado1, Resultados)
    ;   Resultados = Filtrado1
    ),

    reply_json_dict(_{
        status: "ok",
        ciudad: Ciudad,
        provincia: Provincia,
        candidatos: Resultados
    }).

% -----------------------------
% ENDPOINT: OFERTAS POR EMPRESA
% -----------------------------
:- http_handler(root(ofertas_por_empresa), handle_ofertas_por_empresa, []).

handle_ofertas_por_empresa(Request) :-
    http_parameters(Request, [id_empresa(EmpresaIDAtom, [])]),
    atom_number(EmpresaIDAtom, EmpresaID),
    
    findall(
        _{id: ID, titulo: Titulo, descripcion: Desc, activa: Activa},
        oferta(ID, EmpresaID, Titulo, Activa),
        Ofertas
    ),

    reply_json_dict(_{
        status: "ok",
        id_empresa: EmpresaID,
        ofertas: Ofertas
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
            status: "ok",
            match: true,
            dni: DNI,
            nombre: Nombre,
            apellido: Apellido,
            oferta: OfertaID,
            titulo: Titulo,
            puntaje: Puntaje
        })
    ;   reply_json_dict(_{
            status: "ok", 
            match: false,
            dni: DNI,
            oferta: OfertaID,
            puntaje: 0
        })
    ).

% -----------------------------
% ENDPOINT: APRENDIZAJE AUTOMÁTICO
% -----------------------------
:- http_handler(root(aprender), handle_aprender, []).

handle_aprender(_Request) :-
    (   catch(aprender_co_ocurrencia, Error, 
        (format(user_error, "❌ Error en aprendizaje: ~w~n", [Error]), fail))
    ->  guardar_relaciones_en_db,  % ← AGREGAR ESTA LÍNEA
        reply_json_dict(_{
            status: "ok", 
            message: "Sistema de aprendizaje ejecutado correctamente"
        })
    ;   reply_json_dict(_{
            status: "error",
            message: "No se pudo ejecutar el aprendizaje"
        })
    ).

% -----------------------------
% ENDPOINT: BÚSQUEDA SEMÁNTICA
% -----------------------------
:- http_handler(root(buscar_semantica), handle_buscar_semantica, []).

handle_buscar_semantica(Request) :-
    http_parameters(Request, [consulta(Consulta, [])]),
    
    (   catch(buscar_semantica(Consulta, Resultados), Error,
        (format(user_error, "❌ Error en búsqueda semántica: ~w~n", [Error]),
         Resultados = []))
    ->  true
    ;   Resultados = []
    ),
    
    findall(
        _{id_actividad: Id, nombre: Nombre, area: Area, puntaje: Puntaje},
        member([Puntaje, Id, Nombre, Area], Resultados),
        ResultadosFormateados
    ),
    
    reply_json_dict(_{
        status: "ok",
        consulta: Consulta,
        resultados: ResultadosFormateados,
        total: length(ResultadosFormateados)
    }).

% -----------------------------
% ENDPOINT: RECOMENDACIONES DE HABILIDADES
% -----------------------------
:- http_handler(root(recomendaciones_habilidades), handle_recomendaciones_habilidades, []).

handle_recomendaciones_habilidades(Request) :-
    http_parameters(Request, [dni(DniAtom, [])]),
    atom_number(DniAtom, DNI),
    
    % SIEMPRE verificar y cargar datos actualizados
    recargar_hechos,
    
    (   catch(recomendaciones_habilidades(DNI, Recomendaciones), Error,
        (format(user_error, "❌ Error en recomendaciones: ~w~n", [Error]),
         Recomendaciones = []))
    ->  findall(
            _{habilidad: Habilidad, confianza: Confianza, razon: Razon},
            member([Confianza, Habilidad, Razon], Recomendaciones),
            Resultados
        )
    ;   Resultados = []
    ),
    
    reply_json_dict(_{
        status: "ok",
        dni: DNI,
        recomendaciones: Resultados
    }).

% -----------------------------
% ENDPOINT: RELACIONES APRENDIDAS
% -----------------------------
:- http_handler(root(relaciones_aprendidas), handle_relaciones_aprendidas, []).

handle_relaciones_aprendidas(_Request) :-
    (   catch(findall(
            _{habilidad_base: H1, habilidad_objetivo: H2, confianza: Conf, frecuencia: Frec},
            relacion_co_ocurrencia(H1, H2, Conf, Frec),
            Relaciones
        ), Error,
        (format(user_error, "❌ Error obteniendo relaciones: ~w~n", [Error]),
         Relaciones = []))
    ->  true
    ;   Relaciones = []
    ),
    
    length(Relaciones, Total),
    reply_json_dict(_{
        status: "ok",
        total_relaciones: Total,
        relaciones: Relaciones
    }).

% -----------------------------
% GUARDAR Y SINCRONIZAR RELACIONES (VERSIÓN MEJORADA)
% -----------------------------
guardar_relaciones_en_db :-
    format(user_error, '💾 Procesando relaciones aprendidas...~n', []),
    
    findall([H1, H2, C, F], relacion_co_ocurrencia(H1, H2, C, F), Relaciones),
    length(Relaciones, Total),
    
    % 1. Guardar en archivo local
    setup_call_cleanup(
        open('/app/data/relaciones_aprendidas.pl', write, Stream),
        (
            format(Stream, "%% Relaciones de co-ocurrencia aprendidas~n", []),
            format(Stream, "%% Generado automáticamente - ~w~n", [now]),
            format(Stream, "%% Total: ~d relaciones~n%~n", [Total]),
            forall(member([H1, H2, C, F], Relaciones),
                   format(Stream, "relacion_co_ocurrencia(~q, ~q, ~w, ~w).~n", [H1, H2, C, F]))
        ),
        close(Stream)
    ),
    
    format(user_error, '✅ ~d relaciones guardadas localmente~n', [Total]),
    
    % 2. Intentar sincronización automática (pero no fallar si no funciona)
    (   Total > 0
    ->  format(user_error, '🔄 Intentando sincronización automática...~n', []),
        (   catch(sincronizar_con_backend_seguro(Relaciones), Error,
                format(user_error, '⚠️  Sincronización falló: ~w~n', [Error]))
        ->  true
        ;   format(user_error, '⚠️  Sincronización no disponible~n', [])
        )
    ;   format(user_error, '📭 No hay relaciones para sincronizar~n', [])
    ).

% -----------------------------
% SINCRONIZACIÓN SEGURA (NO REINICIA)
% -----------------------------
sincronizar_con_backend_seguro(Relaciones) :-
    length(Relaciones, Total),
    format(user_error, '📤 Enviando ~d relaciones al backend...~n', [Total]),
    
    % Convertir relaciones a formato JSON
    relacionales_a_json(Relaciones, JSONRelaciones),
    
    % URL del endpoint
    BackendURL = 'http://backend:3000/api/relaciones-aprendidas/prolog/sincronizar',
    
    % Enviar HTTP POST con manejo seguro
    catch(
        http_post(BackendURL, 
                 json(JSONRelaciones), 
                 _, 
                 [status_code(Code), timeout(5)]),
        Error,
        (format(user_error, '🌐 Error de conexión: ~w~n', [Error]), fail)
    ),
    
    (   Code = 200
    ->  format(user_error, '✅ Sincronización exitosa~n', [])
    ;   format(user_error, '❌ Error en sincronización. Código: ~d~n', [Code]),
        fail
    ).

% -----------------------------
% CONVERTIR RELACIONES A JSON (EXISTENTE)
% -----------------------------
relacionales_a_json(Relaciones, JSON) :-
    findall(
        _{habilidad_base: H1, habilidad_objetivo: H2, confianza: C, frecuencia: F},
        member([H1, H2, C, F], Relaciones),
        ListaJSON
    ),
    % ELIMINAR el length() - pasar solo el diccionario
    JSON = _{relaciones: ListaJSON}.

% -----------------------------
% ENDPOINT: DIAGNÓSTICO DE DATOS
% -----------------------------
:- http_handler(root(diagnostico), handle_diagnostico, []).

handle_diagnostico(_Request) :-
    % Contar personas
    findall(DNI, persona(DNI, _, _, _, _), Personas),
    length(Personas, TotalPersonas),
    
    % Contar actividades
    findall(Act, actividad(Act, _, _, _, _), Actividades),
    length(Actividades, TotalActividades),
    
    % Contar relaciones persona-actividad
    findall(PA, persona_actividad(_, _, _, _), RelacionesPA),
    length(RelacionesPA, TotalRelacionesPA),
    
    % Mostrar algunas actividades de ejemplo
    findall(Nombre, actividad(_, Nombre, _, _, _), NombresActividades),
    
    % Mostrar algunas relaciones de ejemplo
    findall([DNI, Act, Nivel], persona_actividad(DNI, Act, Nivel, _), EjemplosRelaciones),
    
    reply_json_dict(_{
        status: "ok",
        resumen: _{
            total_personas: TotalPersonas,
            total_actividades: TotalActividades,
            total_relaciones_persona_actividad: TotalRelacionesPA
        },
        actividades_ejemplo: NombresActividades,
        relaciones_ejemplo: EjemplosRelaciones
    }).
% -----------------------------
% ENDPOINT: DIAGNÓSTICO DE ARCHIVOS
% -----------------------------
:- http_handler(root(diagnostico_archivos), handle_diagnostico_archivos, []).

handle_diagnostico_archivos(_Request) :-
    Archivos = [
        '/app/data/hechos.pl',
        '/app/data/ofertas.pl', 
        '/app/data/relaciones.pl',
        '/app/data/postulaciones.pl',
        '/app/data/relaciones_aprendidas.pl'
    ],
    
    findall(Info, (
        member(Archivo, Archivos),
        (   exists_file(Archivo)
        ->  size_file(Archivo, Size),
            Info = _{archivo: Archivo, existe: true, tamaño: Size}
        ;   Info = _{archivo: Archivo, existe: false, tamaño: 0}
        )
    ), InfoArchivos),
    
    reply_json_dict(_{
        status: "ok",
        archivos: InfoArchivos
    }).

% -----------------------------
% ENDPOINT: DEBUG RECOMENDACIONES
% -----------------------------
:- http_handler(root(debug_recomendaciones), handle_debug_recomendaciones, []).

handle_debug_recomendaciones(Request) :-
    http_parameters(Request, [dni(DniAtom, [])]),
    atom_number(DniAtom, DNI),
    
    format(user_error, "🔍 Debugging recomendaciones para DNI ~w~n", [DNI]),
    
    % 1. Verificar habilidades del usuario
    findall([Id, Nombre, Nivel], 
            (persona_actividad(DNI, Id, Nivel, _), actividad(Id, Nombre, _, _, _)), 
            Habilidades),
    
    format(user_error, "📝 Habilidades del usuario: ~w~n", [Habilidades]),
    
    % 2. Buscar relaciones posibles
    findall([Base, Objetivo, Conf], 
            (member([IdBase, Base, _], Habilidades),
             relacion_co_ocurrencia(Base, Objetivo, Conf, _)),
            TodasRelaciones),
    
    format(user_error, "🔗 Todas relaciones: ~w~n", [TodasRelaciones]),
    
    % 3. Filtrar relaciones que NO sean habilidades del usuario
    findall([Base, Objetivo, Conf], 
            (member([IdBase, Base, _], Habilidades),
             relacion_co_ocurrencia(Base, Objetivo, Conf, _),
             not((member([_, Existente, _], Habilidades), Existente = Objetivo))),
            RelacionesPosibles),
    
    format(user_error, "🎯 Relaciones posibles (sin duplicados): ~w~n", [RelacionesPosibles]),
    
    reply_json_dict(_{
        status: "ok",
        dni: DNI,
        habilidades_usuario: Habilidades,
        todas_relaciones: TodasRelaciones,
        relaciones_posibles: RelacionesPosibles
    }).

% -----------------------------
% ENDPOINT: EXPANDIR PALABRAS
% -----------------------------
:- http_handler(root(expandir), handle_expandir, [method(post)]).

handle_expandir(Request) :-
    http_read_json_dict(Request, Dict),
    (   _{palabras: Lista} :< Dict
    ->  true
    ;   reply_json_dict(_{status: "error", message: "Falta 'palabras'"}, [status(400)]), fail
    ),

    % Convertir lista de strings en una sola consulta
    atomic_list_concat(Lista, ' ', Consulta),

    % Llamar al motor semántico
    (   catch(buscar_semantica(Consulta, Resultados), _, Resultados = [])
    ->  true
    ;   Resultados = []
    ),

    % Extraer nombres de actividades recomendadas
    findall(Nombre,
        member([_, _, Nombre, _], Resultados),
        ExpandidasEncontradas
    ),

    % Fusionar lista original + nuevas palabras
    append(Lista, ExpandidasEncontradas, Mezcla),
    sort(Mezcla, ExpandidasUnicas),

    reply_json_dict(_{
        status: "ok",
        palabras: Lista,
        expandidas: ExpandidasUnicas
    }).
