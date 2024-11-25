package com.anonymous.liveactivitytimer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class TimerBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            TimerService.ACTION_PAUSE -> TimerServiceModule.instance?.emitTimerPaused()
            TimerService.ACTION_RESUME -> TimerServiceModule.instance?.emitTimerResume()
            TimerService.ACTION_STOP -> TimerServiceModule.instance?.emitTimerReset()
            TimerService.ACTION_RESTART -> TimerServiceModule.instance?.emitTimerRestart()
        }
    }
}