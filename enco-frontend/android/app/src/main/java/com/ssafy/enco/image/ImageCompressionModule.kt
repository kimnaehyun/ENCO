package com.ssafy.enco.image

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

@ReactModule(name = ImageCompressionModule.NAME)
class ImageCompressionModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "ImageCompression"
    private const val DEFAULT_MAX_WIDTH = 1600
    private const val DEFAULT_MAX_HEIGHT = 1600
    private const val DEFAULT_QUALITY = 72
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun compressImage(imageUri: String, options: ReadableMap?, promise: Promise) {
    try {
      val uri = Uri.parse(imageUri)
      val maxWidth = options?.getInt("maxWidth") ?: DEFAULT_MAX_WIDTH
      val maxHeight = options?.getInt("maxHeight") ?: DEFAULT_MAX_HEIGHT
      val quality = options?.getInt("quality") ?: DEFAULT_QUALITY

      val bounds = BitmapFactory.Options().apply {
        inJustDecodeBounds = true
      }

      openInputStream(uri).use { input ->
        BitmapFactory.decodeStream(input, null, bounds)
      }

      val sourceWidth = bounds.outWidth
      val sourceHeight = bounds.outHeight

      if (sourceWidth <= 0 || sourceHeight <= 0) {
        promise.reject("IMAGE_COMPRESS_INVALID_BOUNDS", "Unable to decode image bounds")
        return
      }

      val decodeOptions = BitmapFactory.Options().apply {
        inSampleSize = calculateInSampleSize(sourceWidth, sourceHeight, maxWidth, maxHeight)
        inPreferredConfig = Bitmap.Config.ARGB_8888
      }

      val decodedBitmap = openInputStream(uri).use { input ->
        BitmapFactory.decodeStream(input, null, decodeOptions)
      }

      if (decodedBitmap == null) {
        promise.reject("IMAGE_COMPRESS_DECODE_FAILED", "Unable to decode bitmap")
        return
      }

      val targetSize = calculateTargetSize(
        decodedBitmap.width,
        decodedBitmap.height,
        maxWidth,
        maxHeight,
      )

      val scaledBitmap = if (
        decodedBitmap.width == targetSize.first &&
          decodedBitmap.height == targetSize.second
      ) {
        decodedBitmap
      } else {
        Bitmap.createScaledBitmap(
          decodedBitmap,
          targetSize.first,
          targetSize.second,
          true,
        ).also {
          decodedBitmap.recycle()
        }
      }

      val outputFile = File.createTempFile(
        "receipt-compressed-",
        ".jpg",
        reactApplicationContext.cacheDir,
      )

      FileOutputStream(outputFile).use { output ->
        scaledBitmap.compress(Bitmap.CompressFormat.JPEG, quality.coerceIn(40, 95), output)
        output.flush()
      }

      if (scaledBitmap != decodedBitmap && !decodedBitmap.isRecycled) {
        decodedBitmap.recycle()
      }
      if (!scaledBitmap.isRecycled) {
        scaledBitmap.recycle()
      }

      val result = Arguments.createMap().apply {
        putString("uri", Uri.fromFile(outputFile).toString())
        putString("fileName", outputFile.name)
        putString("mimeType", "image/jpeg")
        putInt("width", targetSize.first)
        putInt("height", targetSize.second)
        putDouble("fileSize", outputFile.length().toDouble())
      }

      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject(
        "IMAGE_COMPRESS_FAILED",
        error.message ?: "Failed to compress image",
        error,
      )
    }
  }

  private fun openInputStream(uri: Uri): InputStream {
    return reactApplicationContext.contentResolver.openInputStream(uri)
      ?: throw IOException("Unable to open input stream for $uri")
  }

  private fun calculateInSampleSize(
    width: Int,
    height: Int,
    maxWidth: Int,
    maxHeight: Int,
  ): Int {
    var inSampleSize = 1

    if (height > maxHeight || width > maxWidth) {
      var halfHeight = height / 2
      var halfWidth = width / 2

      while (
        halfHeight / inSampleSize >= maxHeight &&
          halfWidth / inSampleSize >= maxWidth
      ) {
        inSampleSize *= 2
      }
    }

    return max(1, inSampleSize)
  }

  private fun calculateTargetSize(
    width: Int,
    height: Int,
    maxWidth: Int,
    maxHeight: Int,
  ): Pair<Int, Int> {
    val ratio = min(maxWidth.toFloat() / width.toFloat(), maxHeight.toFloat() / height.toFloat())

    if (ratio >= 1f) {
      return Pair(width, height)
    }

    return Pair(
      max(1, (width * ratio).roundToInt()),
      max(1, (height * ratio).roundToInt()),
    )
  }
}