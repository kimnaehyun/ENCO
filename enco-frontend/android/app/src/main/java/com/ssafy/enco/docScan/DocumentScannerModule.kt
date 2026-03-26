package com.ssafy.enco.docScan

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.result.IntentSenderRequest
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult

@ReactModule(name = DocumentScannerModule.NAME)
class DocumentScannerModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "DocumentScanner"
    private const val TAG = "DocumentScannerModule"
  }

  private var pendingPromise: Promise? = null

  override fun getName(): String = NAME

  @ReactMethod
  fun startDocumentScan(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("DOCUMENT_SCAN_NO_ACTIVITY", "Current activity is null")
      return
    }
    if (activity !is ComponentActivity) {
      promise.reject(
        "DOCUMENT_SCAN_UNSUPPORTED_ACTIVITY",
        "Current activity does not support Activity Result API",
      )
      return
    }
    if (pendingPromise != null) {
      promise.reject("DOCUMENT_SCAN_IN_PROGRESS", "Document scan already in progress")
      return
    }

    pendingPromise = promise

    val options = GmsDocumentScannerOptions.Builder()
      .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
      .setGalleryImportAllowed(true)
      .setPageLimit(5)
      .setResultFormats(
        GmsDocumentScannerOptions.RESULT_FORMAT_JPEG,
        GmsDocumentScannerOptions.RESULT_FORMAT_PDF,
      )
      .build()

    val scanner = GmsDocumentScanning.getClient(options)

    scanner.getStartScanIntent(activity)
      .addOnSuccessListener { intentSender ->
        val request = IntentSenderRequest.Builder(intentSender).build()
        val launched = DocumentScannerLauncher.launch(activity, request) { result ->
          handleScanResult(result.resultCode, result.data)
        }

        if (!launched) {
          clearPendingPromise()?.reject(
            "DOCUMENT_SCAN_LAUNCH_FAILED",
            "Failed to launch document scanner",
          )
        }
      }
      .addOnFailureListener { error ->
        Log.e(TAG, "Failed to create document scan intent", error)
        clearPendingPromise()?.reject(
          "DOCUMENT_SCAN_START_FAILED",
          error.localizedMessage ?: "Failed to start document scan",
          error,
        )
      }
  }

  private fun handleScanResult(resultCode: Int, data: Intent?) {
    val promise = clearPendingPromise() ?: return

    if (resultCode == Activity.RESULT_CANCELED) {
      promise.reject("DOCUMENT_SCAN_CANCELLED", "User cancelled document scan")
      return
    }

    if (resultCode != Activity.RESULT_OK || data == null) {
      promise.reject("DOCUMENT_SCAN_FAILED", "Document scan did not return a valid result")
      return
    }

    try {
      val scanResult = GmsDocumentScanningResult.fromActivityResultIntent(data)
      val imageUris = Arguments.createArray()
      val pages = scanResult?.pages ?: emptyList()

      pages.forEach { page ->
        val uriString = page.imageUri.toString()
        if (uriString.isNotBlank()) {
          imageUris.pushString(uriString)
        }
      }

      val firstImageUri = if (imageUris.size() > 0) imageUris.getString(0) else null
      val pdfUri = scanResult?.pdf?.uri?.toString()

      val result = Arguments.createMap().apply {
        putString("status", "success")
        putArray("imageUris", imageUris)
        putString("firstImageUri", firstImageUri)
        putString("pdfUri", pdfUri)
      }

      promise.resolve(result)
    } catch (error: Exception) {
      Log.e(TAG, "Failed to parse document scan result", error)
      promise.reject(
        "DOCUMENT_SCAN_RESULT_PARSE_FAILED",
        error.localizedMessage ?: "Failed to parse document scan result",
        error,
      )
    }
  }

  private fun clearPendingPromise(): Promise? {
    val promise = pendingPromise
    pendingPromise = null
    return promise
  }
}
