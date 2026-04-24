import os
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import numpy as np
import cv2
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import FileSystemStorage
from .models import Video

# ✅ Global model variable — loaded once, reused on every request
_model = None

def load_model_once():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), 'ai_models', 'best_vgg16_lstm.keras')
        print(f"[SentinelX] Loading model from: {model_path}")

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at: {model_path}\n"
                "Make sure best_vgg16_lstm.keras is inside backend/api/ai_models/"
            )

        # Try tf_keras first (most compatible with VGG16+LSTM .keras files)
        try:
            import tf_keras
            _model = tf_keras.models.load_model(model_path, compile=False)
            print("[SentinelX] ✅ Model loaded via tf_keras")
            return _model
        except Exception as e1:
            print(f"[SentinelX] tf_keras failed: {e1}")

        # Fallback: standard tf.keras
        try:
            import tensorflow as tf
            _model = tf.keras.models.load_model(model_path, compile=False)
            print("[SentinelX] ✅ Model loaded via tf.keras")
            return _model
        except Exception as e2:
            print(f"[SentinelX] tf.keras failed: {e2}")

        # Fallback: rebuild architecture + load weights
        try:
            _model = _build_vgg16_lstm()
            _model.load_weights(model_path)
            print("[SentinelX] ✅ Model loaded via manual build + weights")
            return _model
        except Exception as e3:
            raise Exception(
                f"All 3 model loading methods failed.\n"
                f"Last error: {e3}\n"
                "Try: pip install tf-keras tensorflow==2.13"
            )

    return _model


def _build_vgg16_lstm():
    """Rebuild VGG16+LSTM architecture to match the trained model."""
    import tensorflow as tf
    from tensorflow.keras.applications import VGG16
    from tensorflow.keras.layers import TimeDistributed, LSTM, Dense, Dropout, Flatten
    from tensorflow.keras.models import Sequential

    vgg = VGG16(weights=None, include_top=False, input_shape=(224, 224, 3))
    model = Sequential([
        TimeDistributed(vgg, input_shape=(16, 224, 224, 3)),
        TimeDistributed(Flatten()),
        LSTM(256, return_sequences=False),
        Dropout(0.5),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(1, activation='sigmoid'),
    ])
    return model


def _extract_frames(file_path, max_frames=16, img_size=(224, 224)):
    """
    Extract evenly-spaced frames from the video.
    Returns list of numpy arrays (H, W, 3) normalized to [0, 1].
    """
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {file_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps          = cap.get(cv2.CAP_PROP_FPS)
    duration_sec = total_frames / fps if fps > 0 else 0

    print(f"[SentinelX] Video: {total_frames} frames, {fps:.1f} fps, {duration_sec:.1f}s")

    # Evenly sample frame indices so we cover the whole video
    if total_frames <= max_frames:
        indices = list(range(total_frames))
    else:
        indices = [int(i * total_frames / max_frames) for i in range(max_frames)]

    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue
        frame = cv2.resize(frame, img_size)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = frame.astype(np.float32) / 255.0
        frames.append(frame)

    cap.release()
    return frames, fps, total_frames


class VideoUploadView(APIView):
    """
    POST /api/upload/
    Accepts: multipart/form-data with field 'video'
    Returns: { result, confidence, label, video_id, fps, total_frames }
    """

    MAX_FRAMES = 16
    IMG_SIZE   = (224, 224)
    THRESHOLD  = 0.5   # ← lower than 0.6 catches more suspicious activity

    def post(self, request):
        # ── 1. Validate file ─────────────────────────────────────────────
        if 'video' not in request.FILES:
            return Response(
                {"error": "No video file provided. Send field name: 'video'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        video_file = request.FILES['video']
        allowed_types = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo']
        if video_file.content_type not in allowed_types:
            return Response(
                {"error": f"Unsupported file type: {video_file.content_type}. Use MP4, AVI, MOV, or MKV."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── 2. Save file temporarily ──────────────────────────────────────
        fs = FileSystemStorage()
        filename  = fs.save(video_file.name, video_file)
        file_path = fs.path(filename)
        print(f"[SentinelX] Saved upload to: {file_path}")

        try:
            # ── 3. Load model ─────────────────────────────────────────────
            model = load_model_once()

            # ── 4. Extract frames ─────────────────────────────────────────
            frames, fps, total_frames = _extract_frames(
                file_path,
                max_frames=self.MAX_FRAMES,
                img_size=self.IMG_SIZE,
            )

            if len(frames) == 0:
                return Response(
                    {"error": "Could not extract any frames from the video. The file may be corrupted."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Pad with black frames if video is shorter than MAX_FRAMES
            while len(frames) < self.MAX_FRAMES:
                frames.append(np.zeros((self.IMG_SIZE[1], self.IMG_SIZE[0], 3), dtype=np.float32))

            # Use exactly MAX_FRAMES
            frames = frames[:self.MAX_FRAMES]

            # ── 5. Run prediction ─────────────────────────────────────────
            input_data = np.array([frames], dtype=np.float32)
            print(f"[SentinelX] Running prediction on shape: {input_data.shape}")

            raw_pred   = float(model.predict(input_data, verbose=0)[0][0])
            confidence = round(raw_pred * 100, 2)

            # Classification
            if raw_pred >= self.THRESHOLD:
                result = "Suspicious"
                label  = "🚨 SUSPICIOUS ACTIVITY DETECTED"
            else:
                result = "Normal"
                label  = "✅ NORMAL ACTIVITY"

            print(f"[SentinelX] Result: {result} | Confidence: {confidence}% | Raw: {raw_pred:.4f}")

            # ── 6. Save to database ───────────────────────────────────────
            video_obj = Video.objects.create(
                title=video_file.name,
                video_file=filename,
                prediction_result=result,
                confidence=confidence,
            )

            # ── 7. Return structured response ─────────────────────────────
            return Response({
                "message"      : "Video analyzed successfully",
                "result"       : result,           # "Suspicious" or "Normal"
                "label"        : label,            # Human-readable label
                "confidence"   : confidence,        # 0.00 – 100.00
                "raw_score"    : round(raw_pred, 4),
                "threshold"    : self.THRESHOLD,
                "video_id"     : video_obj.id,
                "fps"          : round(fps, 2),
                "total_frames" : total_frames,
                "frames_used"  : self.MAX_FRAMES,

                # ✅ This key matches UploadSession.jsx DetectionRow component
                "detections": [
                    {
                        "frame"     : i + 1,
                        "label"     : result,
                        "confidence": confidence,
                    }
                    for i in range(1)
                ],
            }, status=status.HTTP_200_OK)

        except FileNotFoundError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"[SentinelX] ❌ Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Detection failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        finally:
            # Always clean up the uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"[SentinelX] Cleaned up: {file_path}")
