import matplotlib.pyplot as plt
from PIL import Image
import sys

try:
    # Load and display the image
    img = Image.open('attached_assets/IMG_0949_1759057696886.jpeg')
    
    plt.figure(figsize=(12, 8))
    plt.imshow(img)
    plt.axis('off')
    plt.title('Screenshot del Problema', fontsize=16)
    plt.tight_layout()
    plt.show()
    
    print(f"Immagine caricata con successo!")
    print(f"Dimensioni: {img.size}")
    print(f"Formato: {img.format}")
    
except Exception as e:
    print(f"Errore nel caricare l'immagine: {e}")