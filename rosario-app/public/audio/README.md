# Directorio de Audio para Ave María Rosario

Esta carpeta contiene los archivos de audio para la aplicación.

## Estructura

```
audio/
├── prayers/        # Oraciones individuales
│   ├── sign-of-cross.mp3
│   ├── credo.mp3
│   ├── padre-nuestro.mp3
│   ├── ave-maria.mp3
│   ├── gloria.mp3
│   ├── fatima.mp3
│   └── salve.mp3
├── mysteries/      # Audios de introducción a cada misterio [NUEVO]
│   ├── gozosos_1.mp3 ... gozosos_5.mp3
│   ├── dolorosos_1.mp3 ... dolorosos_5.mp3
│   ├── gloriosos_1.mp3 ... gloriosos_5.mp3
│   └── luminosos_1.mp3 ... luminosos_5.mp3
├── rosarios/       # Rosarios completos (Audio continuo)
│   ├── rosario-gozosos.mp3
│   ├── rosario-dolorosos.mp3
│   ├── rosario-gloriosos.mp3
│   └── rosario-luminosos.mp3
└── music/          # Música de fondo
    └── ave_maria_instrumental.mp3
```

## Convención de Nombres (Naming Convention)

Para que el sistema reconozca los archivos, deben tener **exactamente** estos nombres y estar en la carpeta correcta:

### 1. Oraciones (`/audio/prayers/`)
- `sign-of-cross.mp3` (Por la señal de la Santa Cruz)
- `credo.mp3`
- `padre-nuestro.mp3`
- `ave-maria.mp3`
- `gloria.mp3`
- `fatima.mp3` (Jaculatoria de Fátima)
- `salve.mp3`

### 2. Misterios (`/audio/mysteries/`)
Cada misterio tiene un archivo individual que se reproduce al inicio (intro + meditación).
- **Gozosos**: `gozosos_1.mp3`, `gozosos_2.mp3`, `gozosos_3.mp3`, `gozosos_4.mp3`, `gozosos_5.mp3`
- **Dolorosos**: `dolorosos_1.mp3`, `dolorosos_2.mp3`, `dolorosos_3.mp3`, `dolorosos_4.mp3`, `dolorosos_5.mp3`
- **Gloriosos**: `gloriosos_1.mp3`, `gloriosos_2.mp3`, `gloriosos_3.mp3`, `gloriosos_4.mp3`, `gloriosos_5.mp3`
- **Luminosos**: `luminosos_1.mp3`, `luminosos_2.mp3`, `luminosos_3.mp3`, `luminosos_4.mp3`, `luminosos_5.mp3`

### 3. Música de Fondo (`/audio/music/`)
- `ave_maria_instrumental.mp3`

## Nota Importante
La aplicación ya NO utiliza voces sintéticas (TTS). Es **indispensable** que los archivos MP3 existan. Si falta un archivo:
- La app mostrará el texto.
- Esperará un tiempo de lectura prudente (ej. 8 segundos).
- Avanzará automáticamente al siguiente paso.
