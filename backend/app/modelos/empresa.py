
from datetime import datetime
from .usuario import usuario

class empresa(usuario):

    # Constructor de la clase Empresa
    def __init__(self, nombre, direccion, ciudad, provincia, telefono=None, mail= None, activa=True):

        super().__init__(nombre, direccion, ciudad, provincia, telefono, mail, activa)
    
        # Atributos específicos de Empresa pueden añadirse aquí