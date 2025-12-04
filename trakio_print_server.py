"""
=============================================================================
TRAKIO Print Server - Brother QL-1100
=============================================================================
Serveur d'impression local pour imprimer directement sur Brother QL-1100 USB

INSTALLATION (une seule fois):
    1. Installer Python 3.x depuis python.org
    2. Ouvrir CMD et taper:
       pip install brother_ql Pillow flask flask-cors

UTILISATION:
    1. Double-cliquer sur ce fichier pour lancer le serveur
    2. Le serveur tourne en arrière-plan sur http://localhost:5555
    3. Dans TRAKIO, cliquer sur "Imprimer" → impression directe!

CONFIGURATION:
    - Modifier PRINTER_MODEL si différent
    - Modifier PRINTER_IDENTIFIER pour votre imprimante
    - Lancer "brother_ql discover" dans CMD pour trouver votre imprimante
=============================================================================
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
import sys
import socket

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION - MODIFIER ICI SI NÉCESSAIRE
# ═══════════════════════════════════════════════════════════════════════════

PRINTER_MODEL = 'QL-1100'           # Modèle d'imprimante
LABEL_SIZE = '62'                    # Taille étiquette (62mm)
PRINTER_IDENTIFIER = 'usb://0x04f9:0x20a7'  # Brother QL-1100 USB (par défaut)
# Alternatives:
# PRINTER_IDENTIFIER = 'usb://Brother/QL-1100'
# PRINTER_IDENTIFIER = 'tcp://192.168.1.100'  # Si réseau

PORT = 5555  # Port du serveur local

# ═══════════════════════════════════════════════════════════════════════════
# SERVEUR FLASK
# ═══════════════════════════════════════════════════════════════════════════

app = Flask(__name__)
CORS(app)  # Permet les requêtes depuis TRAKIO

def get_local_ip():
    """Obtenir l'IP locale"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def create_label_image(data):
    """
    Créer une image d'étiquette à partir des données
    Format: 62mm = 696 pixels @ 300dpi
    """
    # Dimensions pour 62mm @ 300dpi
    WIDTH = 696
    HEIGHT = 450  # Hauteur variable selon contenu
    
    # Créer image blanche
    img = Image.new('RGB', (WIDTH, HEIGHT), 'white')
    draw = ImageDraw.Draw(img)
    
    # Polices (utiliser des polices système)
    try:
        font_title = ImageFont.truetype("arial.ttf", 42)
        font_bold = ImageFont.truetype("arialbd.ttf", 28)
        font_normal = ImageFont.truetype("arial.ttf", 24)
        font_small = ImageFont.truetype("arial.ttf", 18)
    except:
        # Fallback si polices non trouvées
        font_title = ImageFont.load_default()
        font_bold = font_title
        font_normal = font_title
        font_small = font_title
    
    y = 20
    
    # === HEADER ===
    # Logo BP (rectangle arrondi simulé)
    draw.rectangle([20, y, 90, y+70], fill='#06d6a0')
    draw.text((35, y+15), "BP", font=font_bold, fill='white')
    
    # Nom entreprise
    draw.text((110, y+5), "Borex Poissons", font=font_title, fill='#1a1a2e')
    draw.text((110, y+50), "Qualité & Traçabilité", font=font_small, fill='#888888')
    
    y += 90
    draw.line([(20, y), (WIDTH-20, y)], fill='#dddddd', width=2)
    y += 15
    
    # === INFORMATIONS ===
    def draw_row(label, value, y_pos):
        draw.text((20, y_pos), label, font=font_normal, fill='#888888')
        draw.text((200, y_pos), str(value) if value else '-', font=font_bold, fill='#1a1a2e')
        return y_pos + 40
    
    y = draw_row("Produit", data.get('product', '-'), y)
    y = draw_row("Lot", data.get('lot', '-'), y)
    y = draw_row("Origine", data.get('origin', '-'), y)
    y = draw_row("DLC", data.get('dlc', '-'), y)
    if data.get('weight'):
        y = draw_row("Poids", data.get('weight'), y)
    y = draw_row("Conservation", data.get('temp', '0°C à +2°C'), y)
    
    # === QR CODE ===
    y += 10
    draw.line([(20, y), (WIDTH-20, y)], fill='#dddddd', width=2)
    y += 15
    
    # Générer QR Code avec qrcode library si disponible
    try:
        import qrcode
        qr_data = f"https://borexpoissons.ch/trace/?l={data.get('lot', '')}"
        qr = qrcode.QRCode(version=1, box_size=4, border=1)
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_img = qr_img.resize((120, 120))
        # Centrer le QR
        qr_x = (WIDTH - 120) // 2
        img.paste(qr_img, (qr_x, y))
        y += 130
    except ImportError:
        draw.text((WIDTH//2 - 50, y + 40), "QR Code", font=font_small, fill='#888888')
        y += 100
    
    draw.text((WIDTH//2 - 80, y), "Scannez pour plus d'infos", font=font_small, fill='#888888')
    
    # Recadrer l'image à la bonne hauteur
    img = img.crop((0, 0, WIDTH, y + 30))
    
    return img


def print_to_brother(image):
    """
    Envoyer l'image à l'imprimante Brother QL-1100
    """
    try:
        from brother_ql.raster import BrotherQLRaster
        from brother_ql.backends.helpers import send
        from brother_ql.conversion import convert
        
        # Convertir en mode compatible
        if image.mode != 'L':
            image = image.convert('L')
        
        # Créer les instructions d'impression
        qlr = BrotherQLRaster(PRINTER_MODEL)
        qlr.exception_on_warning = True
        
        instructions = convert(
            qlr=qlr,
            images=[image],
            label=LABEL_SIZE,
            rotate='auto',
            threshold=70.0,
            dither=False,
            compress=False,
            red=False,
            dpi_600=False,
            hq=True,
            cut=True
        )
        
        # Envoyer à l'imprimante
        send(
            instructions=instructions,
            printer_identifier=PRINTER_IDENTIFIER,
            backend_identifier='pyusb',
            blocking=True
        )
        
        return True, "Impression réussie!"
        
    except ImportError as e:
        return False, f"Module brother_ql non installé: {e}"
    except Exception as e:
        return False, f"Erreur d'impression: {e}"


# ═══════════════════════════════════════════════════════════════════════════
# ROUTES API
# ═══════════════════════════════════════════════════════════════════════════

@app.route('/')
def home():
    """Page d'accueil du serveur"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>TRAKIO Print Server</title>
        <style>
            body { font-family: Arial, sans-serif; background: #0a0a0f; color: #fff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #06d6a0; }
            .status { background: #12121a; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .status.ok { border-left: 4px solid #06d6a0; }
            .status.error { border-left: 4px solid #ef476f; }
            code { background: #1a1a25; padding: 2px 8px; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🖨️ TRAKIO Print Server</h1>
            <div class="status ok">
                <strong>✅ Serveur actif</strong><br>
                Port: <code>''' + str(PORT) + '''</code><br>
                Imprimante: <code>''' + PRINTER_MODEL + '''</code>
            </div>
            <p>Ce serveur permet l'impression directe depuis TRAKIO vers votre Brother QL-1100.</p>
            <h3>Test</h3>
            <p>Envoyez une requête POST à <code>/print</code> avec les données d'étiquette.</p>
        </div>
    </body>
    </html>
    '''

@app.route('/status')
def status():
    """Vérifier le statut du serveur"""
    return jsonify({
        'status': 'online',
        'printer': PRINTER_MODEL,
        'label_size': LABEL_SIZE,
        'port': PORT
    })

@app.route('/print', methods=['POST', 'OPTIONS'])
def print_label():
    """
    Imprimer une étiquette
    Données attendues (JSON):
    {
        "product": "Filet de perche",
        "lot": "LC-20251204-001",
        "origin": "Lac Léman, Suisse",
        "dlc": "09.12.2025",
        "weight": "500g",
        "temp": "0°C à +2°C",
        "quantity": 1
    }
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        quantity = data.get('quantity', 1)
        
        # Créer l'image de l'étiquette
        label_image = create_label_image(data)
        
        # Imprimer X fois
        for i in range(quantity):
            success, message = print_to_brother(label_image)
            if not success:
                return jsonify({'success': False, 'error': message}), 500
        
        return jsonify({
            'success': True,
            'message': f'{quantity} étiquette(s) imprimée(s) avec succès!',
            'printer': PRINTER_MODEL
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/preview', methods=['POST'])
def preview_label():
    """Générer un aperçu de l'étiquette (retourne une image PNG)"""
    try:
        data = request.json
        label_image = create_label_image(data)
        
        # Convertir en PNG
        img_io = io.BytesIO()
        label_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/discover')
def discover_printers():
    """Lister les imprimantes Brother connectées"""
    try:
        from brother_ql.backends.helpers import discover
        printers = discover(backend_identifier='pyusb')
        return jsonify({
            'success': True,
            'printers': [str(p) for p in printers]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════
# LANCEMENT
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("=" * 60)
    print("  🖨️  TRAKIO Print Server - Brother QL-1100")
    print("=" * 60)
    print(f"  Serveur démarré sur: http://localhost:{PORT}")
    print(f"  IP locale: http://{get_local_ip()}:{PORT}")
    print(f"  Imprimante: {PRINTER_MODEL}")
    print(f"  Taille étiquette: {LABEL_SIZE}mm")
    print("=" * 60)
    print("  ✅ Prêt pour l'impression depuis TRAKIO!")
    print("  ❌ Fermez cette fenêtre pour arrêter le serveur")
    print("=" * 60)
    
    # Lancer le serveur
    app.run(host='0.0.0.0', port=PORT, debug=False)
