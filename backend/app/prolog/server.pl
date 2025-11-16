#!/usr/bin/env python3
"""
Servicio REST minimalista para Prolog
"""
from flask import Flask, request, jsonify
import subprocess
import tempfile
import os

app = Flask(__name__)

REGLAS_PATH = os.path.join(os.path.dirname(__file__), "reglas.pl")

@app.route('/consultar', methods=['POST'])
def consultar():
    try:
        data = request.json
        consulta = data.get('consulta', '')
        
        # Crear archivo temporal con la consulta
        with tempfile.NamedTemporaryFile(mode='w', suffix='.pl', delete=False) as f:
            f.write(f'consultar :- {consulta}, write("||"), write(X), nl, fail.\n')
            f.write('consultar :- halt.\n')
            temp_file = f.name
        
        # Ejecutar consulta
        resultado = subprocess.run([
            'swipl', '-q', '-t', 'consultar', temp_file
        ], capture_output=True, text=True, timeout=10)
        
        os.unlink(temp_file)
        
        if resultado.returncode == 0:
            lineas = resultado.stdout.strip().split('||')
            resultados = [linea.strip() for linea in lineas[1:] if linea.strip()]
            return jsonify({"success": True, "resultados": resultados})
        else:
            return jsonify({"success": False, "error": resultado.stderr})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)