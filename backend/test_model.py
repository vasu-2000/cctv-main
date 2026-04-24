import tensorflow as tf
import numpy as np
import cv2
import os

# ── 1. Load model ──────────────────────────────────────────
model_path = os.path.join('api', 'ai_models', 'best_vgg16_lstm.keras')
print(f"Loading model from: {model_path}")

model = tf.keras.models.load_model(model_path)
print("✅ Model loaded!")
print(f"Input shape : {model.input_shape}")
print(f"Output shape: {model.output_shape}")

# ── 2. Test with a dummy input ─────────────────────────────
_, MAX_FRAMES, IMG_H, IMG_W, _ = model.input_shape
MAX_FRAMES = MAX_FRAMES or 16
IMG_H = IMG_H or 224
IMG_W = IMG_W or 224

print(f"\nTesting with dummy input: (1, {MAX_FRAMES}, {IMG_H}, {IMG_W}, 3)")
dummy = np.zeros((1, MAX_FRAMES, IMG_H, IMG_W, 3), dtype=np.float32)
pred = model.predict(dummy, verbose=0)[0][0]
print(f"✅ Dummy prediction: {pred:.4f}")

# ── 3. Test with real video (optional) ────────────────────
video_path = input("\nEnter path to a test video (or press Enter to skip): ").strip()

if video_path and os.path.exists(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []

    while len(frames) < MAX_FRAMES:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, (IMG_W, IMG_H))
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) / 255.0
        frames.append(frame)
    cap.release()

    while len(frames) < MAX_FRAMES:
        frames.append(np.zeros((IMG_H, IMG_W, 3)))

    input_data = np.array([frames], dtype=np.float32)
    prediction = model.predict(input_data, verbose=0)[0][0]
    confidence = prediction * 100
    result = "🚨 SUSPICIOUS" if prediction > 0.6 else "✅ NORMAL"

    print(f"\nResult     : {result}")
    print(f"Confidence : {confidence:.2f}%")
    print(f"Raw value  : {prediction:.4f}")
else:
    print("Skipping real video test.")

print("\n✅ All tests passed! Model is ready.")