package com.reallifetrack.app

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ForegroundServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ForegroundService"
    }

    @ReactMethod
    fun startService(message: String) {
        val context = reactApplicationContext
        val serviceIntent = Intent(context, ForegroundService::class.java)
        serviceIntent.putExtra("inputExtra", message)
        ContextCompat.startForegroundService(context, serviceIntent)
    }

    @ReactMethod
    fun stopService() {
        val context = reactApplicationContext
        val serviceIntent = Intent(context, ForegroundService::class.java)
        context.stopService(serviceIntent)
    }
}
