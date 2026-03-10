package com.frontend.ocr

import android.net.Uri
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions

class OcrModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val recognizer by lazy {
    TextRecognition.getClient(
      KoreanTextRecognizerOptions.Builder().build()
    )
  }

  override fun getName(): String = "OcrModule"

  @ReactMethod
  fun recognizeTextFromUri(imageUri: String, promise: Promise) {
    try {
      val uri = Uri.parse(imageUri)
      val image = InputImage.fromFilePath(reactContext, uri)

      recognizer.process(image)
        .addOnSuccessListener { visionText ->
          promise.resolve(visionText.text)
        }
        .addOnFailureListener { e ->
          promise.reject("OCR_FAILED", e.message, e)
        }
    } catch (e: Exception) {
      promise.reject("IMAGE_PARSE_FAILED", e.message, e)
    }
  }
}