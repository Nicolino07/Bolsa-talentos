
# Superclase Usuario 
class usuario():

    # Constructor superclase Usuario
    def __init__(self, nombre, direccion, ciudad, provincia, telefono=None, mail= None, activa=True):
        self.nombre = nombre
        self.direccion = direccion
        self.ciudad = ciudad
        self.provincia = provincia
        self.mail = mail
        self.telefono = telefono
        self.activa = activa


    def modificarActiva(self,estado):   
        self.activa = estado

    # Métodos comunes a Persona y Empresa 

    def getDatosContacto(self):
        return {
            "nombre": self.nombre,
            "direccion": self.direccion,
            "ciudad": self.ciudad,
            "provincia": self.provincia,
            "mail": self.mail,
            "telefono": self.telefono
        }