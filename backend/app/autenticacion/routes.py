from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from sqlalchemy import func 
from .models import Usuario, UsuarioLogin, PersonaRegistro, EmpresaRegistro, Token, UsuarioResponse
from app.personas.models import Persona
from app.empresas.models import Empresa
from .security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["autenticación"])
security = HTTPBearer()

# Dependencia para obtener usuario actual
async def get_current_active_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    return user

@router.post("/registro/persona", response_model=dict)
async def registro_persona(persona_data: PersonaRegistro, db: Session = Depends(get_db)):
    try:
        # Verificar si email ya existe
        usuario_existente = db.query(Usuario).filter(Usuario.email == persona_data.email).first()
        if usuario_existente:
            raise HTTPException(status_code=400, detail="Email ya registrado")
        
        # Verificar si DNI ya existe
        persona_existente = db.query(Persona).filter(Persona.dni == persona_data.dni).first()
        if persona_existente:
            raise HTTPException(status_code=400, detail="DNI ya registrado")
        
        # Hashear password
        password_hash = get_password_hash(persona_data.password)
        
        # Crear persona
        nueva_persona = Persona(
            dni=persona_data.dni,
            nombre=persona_data.nombre,
            apellido=persona_data.apellido,
            fecha_nacimiento=persona_data.fecha_nacimiento,
            direccion=persona_data.direccion,
            ciudad=persona_data.ciudad,
            provincia=persona_data.provincia,
            sexo=persona_data.sexo,
            email=persona_data.email,
            telefono=persona_data.telefono
        )
        db.add(nueva_persona)
        db.flush()  # Para obtener el DNI sin hacer commit
        
        # Crear usuario vinculado
        nuevo_usuario = Usuario(
            dni=nueva_persona.dni,
            email=persona_data.email,
            password_hash=password_hash,
            salt="bcrypt_incluye_salt",  # bcrypt ya incluye el salt en el hash
            rol="PERSONA"
        )
        db.add(nuevo_usuario)
        
        db.commit()
        return {"mensaje": "Persona registrada exitosamente", "dni": nueva_persona.dni}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en registro: {str(e)}")

@router.post("/registro/empresa", response_model=dict)
async def registro_empresa(empresa_data: EmpresaRegistro, db: Session = Depends(get_db)):
    try:
        # Verificar si email ya existe
        usuario_existente = db.query(Usuario).filter(Usuario.email == empresa_data.email).first()
        if usuario_existente:
            raise HTTPException(status_code=400, detail="Email ya registrado")
        
        # Hashear password
        password_hash = get_password_hash(empresa_data.password)
        
        # Crear empresa
        nueva_empresa = Empresa(
            nombre=empresa_data.nombre,
            direccion=empresa_data.direccion,
            ciudad=empresa_data.ciudad,
            provincia=empresa_data.provincia,
            email=empresa_data.email,
            telefono=empresa_data.telefono
        )
        db.add(nueva_empresa)
        db.flush()  # Para obtener el ID sin hacer commit
        
        # Crear usuario vinculado
        nuevo_usuario = Usuario(
            id_empresa=nueva_empresa.id_empresa,
            email=empresa_data.email,
            password_hash=password_hash,
            salt="bcrypt_incluye_salt",
            rol="EMPRESA"
        )
        db.add(nuevo_usuario)
        
        db.commit()
        return {"mensaje": "Empresa registrada exitosamente", "id_empresa": nueva_empresa.id_empresa}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en registro: {str(e)}")

@router.post("/login", response_model=Token)
async def login(usuario_data: UsuarioLogin, db: Session = Depends(get_db)):
    try:
        # Buscar usuario por email
        usuario = db.query(Usuario).filter(
            Usuario.email == usuario_data.email, 
            Usuario.activo == True
        ).first()
        
        if not usuario:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        # Verificar password
        if not verify_password(usuario_data.password, usuario.password_hash):
            # Incrementar intentos fallidos
            usuario.intentos_login += 1
            db.commit()
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        # Actualizar último login y resetear intentos
        usuario.ultimo_login = func.now()
        usuario.intentos_login = 0
        db.commit()
        
        # Obtener datos completos según el tipo de usuario
        usuario_info = {}
        
        if usuario.rol == "PERSONA" and usuario.dni:
            # Buscar datos de persona
            persona = db.query(Persona).filter(Persona.dni == usuario.dni).first()
            if persona:
                usuario_info = {
                    "id_usuario": usuario.id_usuario,
                    "email": usuario.email,
                    "rol": usuario.rol,
                    "dni": usuario.dni,
                    "id_empresa": usuario.id_empresa,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "fecha_nacimiento": persona.fecha_nacimiento.isoformat() if persona.fecha_nacimiento else None,
                    "direccion": persona.direccion,
                    "ciudad": persona.ciudad,
                    "provincia": persona.provincia,
                    "sexo": persona.sexo,
                    "telefono": persona.telefono,
                    "fecha_registro": usuario.fecha_registro.isoformat() if usuario.fecha_registro else None,
                    "activo": usuario.activo
                }
        
        elif usuario.rol == "EMPRESA" and usuario.id_empresa:
            # Buscar datos de empresa
            empresa = db.query(Empresa).filter(Empresa.id_empresa == usuario.id_empresa).first()
            if empresa:
                usuario_info = {
                    "id_usuario": usuario.id_usuario,
                    "email": usuario.email,
                    "rol": usuario.rol,
                    "dni": usuario.dni,
                    "id_empresa": usuario.id_empresa,
                    "nombre_empresa": empresa.nombre,
                    "direccion": empresa.direccion,
                    "ciudad": empresa.ciudad,
                    "provincia": empresa.provincia,
                    "telefono": empresa.telefono,
                    "fecha_registro": usuario.fecha_registro.isoformat() if usuario.fecha_registro else None,
                    "activo": usuario.activo
                }
        else:
            # Usuario básico sin persona/empresa vinculada
            usuario_info = {
                "id_usuario": usuario.id_usuario,
                "email": usuario.email,
                "rol": usuario.rol,
                "dni": usuario.dni,
                "id_empresa": usuario.id_empresa,
                "fecha_registro": usuario.fecha_registro.isoformat() if usuario.fecha_registro else None,
                "activo": usuario.activo
            }
        
        # Crear token
        token_data = {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "rol": usuario.rol,
            "dni": usuario.dni,
            "id_empresa": usuario.id_empresa
        }
        access_token = create_access_token(token_data)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            rol=usuario.rol,
            dni=usuario.dni,
            id_empresa=usuario.id_empresa,
            usuario=usuario_info  # ← Agregar datos completos del usuario
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en login: {str(e)}")
@router.get("/me", response_model=UsuarioResponse)
async def get_usuario_actual(usuario_actual: dict = Depends(get_current_active_user)):
    return usuario_actual

@router.post("/logout")
async def logout(usuario_actual: dict = Depends(get_current_active_user)):
    return {"mensaje": "Sesión cerrada exitosamente"}



@router.get("/usuario/completo")
async def get_usuario_completo(usuario_actual: dict = Depends(get_current_active_user), db: Session = Depends(get_db)):
    try:
        usuario_id = usuario_actual.get("id_usuario")
        usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
        
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        usuario_info = {}
        
        if usuario.rol == "PERSONA" and usuario.dni:
            persona = db.query(Persona).filter(Persona.dni == usuario.dni).first()
            if persona:
                usuario_info = {
                    "id_usuario": usuario.id_usuario,
                    "email": usuario.email,
                    "rol": usuario.rol,
                    "dni": usuario.dni,
                    "id_empresa": usuario.id_empresa,
                    "nombre": persona.nombre,
                    "apellido": persona.apellido,
                    "fecha_nacimiento": persona.fecha_nacimiento.isoformat() if persona.fecha_nacimiento else None,
                    "direccion": persona.direccion,
                    "ciudad": persona.ciudad,
                    "provincia": persona.provincia,
                    "sexo": persona.sexo,
                    "telefono": persona.telefono,
                    "fecha_registro": usuario.fecha_registro.isoformat() if usuario.fecha_registro else None,
                    "activo": usuario.activo
                }
        
        elif usuario.rol == "EMPRESA" and usuario.id_empresa:
            empresa = db.query(Empresa).filter(Empresa.id_empresa == usuario.id_empresa).first()
            if empresa:
                usuario_info = {
                    "id_usuario": usuario.id_usuario,
                    "email": usuario.email,
                    "rol": usuario.rol,
                    "dni": usuario.dni,
                    "id_empresa": usuario.id_empresa,
                    "nombre_empresa": empresa.nombre,
                    "direccion": empresa.direccion,
                    "ciudad": empresa.ciudad,
                    "provincia": empresa.provincia,
                    "telefono": empresa.telefono,
                    "fecha_registro": usuario.fecha_registro.isoformat() if usuario.fecha_registro else None,
                    "activo": usuario.activo
                }
        
        return usuario_info
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")