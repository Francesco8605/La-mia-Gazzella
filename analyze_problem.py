#!/usr/bin/env python3
import requests
from PIL import Image
import io

try:
    # Download the image from the web server
    response = requests.get('http://localhost:5000/problem_screenshot.jpeg')
    response.raise_for_status()
    
    # Open the image
    img = Image.open(io.BytesIO(response.content))
    
    print("=" * 60)
    print("ANALISI SCREENSHOT DEL PROBLEMA")
    print("=" * 60)
    print(f"Dimensioni immagine: {img.size}")
    print(f"Formato: {img.format}")
    print(f"Modalità colore: {img.mode}")
    print()
    
    # Save the image in a format we can examine
    img.save('problem_analysis.png', 'PNG')
    print("✅ Immagine salvata come 'problem_analysis.png' per analisi")
    print()
    
    # Get basic image info
    width, height = img.size
    print(f"📱 Risoluzione: {width}x{height} pixel")
    
    # Check if it's a mobile screenshot
    if width < height:
        print("📱 RILEVATO: Screenshot da dispositivo mobile (orientamento verticale)")
    else:
        print("💻 RILEVATO: Screenshot da desktop (orientamento orizzontale)")
    
    print()
    print("🔍 IMMAGINE PRONTA PER ANALISI")
    print("L'immagine è stata elaborata con successo.")
    print("Ora posso analizzare il contenuto per identificare il problema.")
    
except Exception as e:
    print(f"❌ Errore nell'analisi: {e}")
    import traceback
    traceback.print_exc()