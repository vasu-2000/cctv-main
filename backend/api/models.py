from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=255)
    video_file = models.FileField(upload_to='videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    prediction_result = models.CharField(max_length=20, blank=True, null=True)   # "Normal" or "Suspicious"
    confidence = models.FloatField(blank=True, null=True)
    
    def __str__(self):
        return self.title