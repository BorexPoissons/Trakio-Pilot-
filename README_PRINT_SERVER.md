# 🖨️ TRAKIO Print Server - Brother QL-1100

Serveur d'impression local pour imprimer directement depuis TRAKIO vers votre Brother QL-1100 en USB.

## 📦 Installation (une seule fois)

### 1. Installer Python
- Téléchargez Python 3 depuis [python.org](https://python.org)
- **IMPORTANT**: Cochez ✅ "Add Python to PATH" lors de l'installation !

### 2. Installer les dépendances
Ouvrez CMD (Invite de commandes) et tapez :
```
pip install brother_ql Pillow flask flask-cors qrcode
```

### 3. Brancher l'imprimante
- Connectez votre Brother QL-1100 en USB
- Installez le pilote depuis [brother.ch](https://www.brother.ch/fr-ch/support/ql1100/downloads)

## 🚀 Utilisation

### Méthode 1 : Double-clic
1. Double-cliquez sur `START_PRINT_SERVER.bat`
2. Laissez la fenêtre ouverte
3. Dans TRAKIO → Traçabilité → cliquez "Imprimer" !

### Méthode 2 : Manuel
1. Ouvrez CMD dans le dossier
2. Tapez : `python trakio_print_server.py`
3. Le serveur démarre sur http://localhost:5555

## ⚙️ Configuration

Si votre imprimante n'est pas détectée, ouvrez `trakio_print_server.py` et modifiez :

```python
PRINTER_MODEL = 'QL-1100'
PRINTER_IDENTIFIER = 'usb://0x04f9:0x20a7'  # ID USB Brother QL-1100
```

Pour trouver l'ID de votre imprimante :
```
brother_ql discover
```

## 🔧 Dépannage

### "Module brother_ql non trouvé"
```
pip install brother_ql
```

### "Imprimante non trouvée"
1. Vérifiez que l'imprimante est branchée et allumée
2. Tapez `brother_ql discover` dans CMD
3. Copiez l'identifiant dans la configuration

### "Permission denied"
- Lancez CMD en tant qu'administrateur

## 📁 Fichiers

| Fichier | Description |
|---------|-------------|
| `trakio_print_server.py` | Serveur Python principal |
| `START_PRINT_SERVER.bat` | Lanceur Windows |
| `README_PRINT_SERVER.md` | Ce fichier |

## 🌐 API

Le serveur expose ces endpoints :

- `GET /` - Page d'accueil
- `GET /status` - Statut du serveur
- `POST /print` - Imprimer une étiquette
- `POST /preview` - Générer un aperçu PNG
- `GET /discover` - Lister les imprimantes

### Exemple d'impression :
```javascript
fetch('http://localhost:5555/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        product: 'Filet de perche',
        lot: 'LC-20251204-001',
        origin: 'Lac Léman, Suisse',
        dlc: '09.12.2025',
        weight: '500g',
        temp: '0°C à +2°C',
        quantity: 1
    })
});
```

---

💡 **Astuce**: Ajoutez `START_PRINT_SERVER.bat` au démarrage Windows pour que le serveur se lance automatiquement !
