package com.ssafy.enco.docScan

import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import java.util.concurrent.atomic.AtomicBoolean

object DocumentScannerLauncher {
  private var launcher: ActivityResultLauncher<IntentSenderRequest>? = null
  private var callback: ((ActivityResult) -> Unit)? = null
  private val isLaunching = AtomicBoolean(false)

  fun register(activity: ComponentActivity) {
    if (launcher != null) {
      return
    }

    launcher = activity.registerForActivityResult(
      ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
      isLaunching.set(false)
      val pendingCallback = callback
      callback = null
      pendingCallback?.invoke(result)
    }
  }

  fun launch(
    activity: ComponentActivity,
    request: IntentSenderRequest,
    onResult: (ActivityResult) -> Unit,
  ): Boolean {
    val activityLauncher = launcher ?: return false
    if (!isLaunching.compareAndSet(false, true)) {
      return false
    }

    callback = onResult

    return try {
      activityLauncher.launch(request)
      true
    } catch (error: Exception) {
      isLaunching.set(false)
      callback = null
      false
    }
  }
}
