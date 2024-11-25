package com.anonymous.liveactivitytimer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.ServiceCompat.stopForeground
import com.anonymous.liveactivitytimer.TimerService.Companion.ACTION_FINISH
import com.anonymous.liveactivitytimer.TimerService.Companion.ACTION_PAUSE
import com.anonymous.liveactivitytimer.TimerService.Companion.ACTION_RESUME
import com.anonymous.liveactivitytimer.TimerService.Companion.ACTION_STOP
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class TimerServiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private var notificationManager: NotificationManager? = null
    private var startedAt: Long = 0
    private var pausedAt: Long = 0

    init {
        instance = this
        createNotificationChannel(reactContext)
    }

    override fun getName(): String {
        return "TimerServiceModule"
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Timer Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager?.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun startLiveActivity(timestamp: Double, duration: Int) {
        reactApplicationContext.runOnUiQueueThread {
            startedAt = (timestamp * 1000).toLong()

            val context: Context = reactApplicationContext
            val startIntent = Intent(context, TimerService::class.java)
            startIntent.putExtra("timestamp", startedAt)
            startIntent.putExtra("duration", duration)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(startIntent)
            } else {
                context.startService(startIntent)
            }
        }
    }


    @ReactMethod
    fun pauseTimer(timestamp: Double) {
        pausedAt = (timestamp * 1000).toLong()
        val context: Context = reactApplicationContext
        val pauseIntent = Intent(context, TimerService::class.java)
        pauseIntent.putExtra("timestamp", pausedAt)
        pauseIntent.setAction(ACTION_PAUSE)
        context.startService(pauseIntent)
    }

    @ReactMethod
    fun resumeTimer() {
        val context: Context = reactApplicationContext
        val resumeIntent = Intent(context, TimerService::class.java)
        resumeIntent.setAction(ACTION_RESUME)
        context.startService(resumeIntent)
    }

    @ReactMethod
    fun timerEnded() {
        val context: Context = reactApplicationContext
        val finishIntent = Intent(context, TimerService::class.java)
        finishIntent.setAction(ACTION_FINISH)
        context.startService(finishIntent)
    }

    @ReactMethod
    fun stopLiveActivity() {
        val context: Context = reactApplicationContext
        val stopIntent = Intent(context, TimerService::class.java)
        context.stopService(stopIntent)
    }

    private fun sendEvent(eventName: String, params: String?) {
        val context = reactApplicationContext
        if (context.hasActiveCatalystInstance()) {
            context.getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
            ).emit(eventName, params)
        }
    }

    fun emitTimerPaused() {
        sendEvent("onPause", "Timer paused")
    }

    fun emitTimerReset() {
        sendEvent("onReset", "Timer paused")
    }

    fun emitTimerResume() {
        sendEvent("onResume", "Timer paused")
    }

    fun emitTimerRestart() {
        sendEvent("onRestart", "Timer paused")
    }

    fun emitTimerFinished() {
        sendEvent("onFinish", "Timer finished")
    }

    companion object {
        private const val CHANNEL_ID = "TIMER_NOTIFICATION_CHANNEL"

        @Volatile
        var instance: TimerServiceModule? = null
            private set
    }
}