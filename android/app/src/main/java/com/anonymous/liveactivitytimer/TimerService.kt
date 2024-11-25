package com.anonymous.liveactivitytimer

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Binder
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

class TimerService : Service() {
    private val binder = LocalBinder()
    private lateinit var broadcastReceiver: TimerBroadcastReceiver

    inner class LocalBinder : Binder() {
        fun getService(): TimerService = this@TimerService
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    override fun onCreate() {
        super.onCreate()
        broadcastReceiver = TimerBroadcastReceiver()
        val intentFilter = IntentFilter().apply {
            addAction(ACTION_PAUSE)
            addAction(ACTION_RESUME)
            addAction(ACTION_STOP)
            addAction(ACTION_RESTART)
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(broadcastReceiver, intentFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(broadcastReceiver, intentFilter)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isPaused = true
        unregisterReceiver(broadcastReceiver)
    }

    private val handler = Handler(Looper.getMainLooper())
    private var progress: Int = 0
    private var limitTime: Int = 0
    private var startedAt: Long = 0
    private var pausedAt: Long = 0
    private var isPaused = false
    private var notificationManager: NotificationManager? = null
    private var notificationBuilder: NotificationCompat.Builder? = null
    private var notificationLayout: RemoteViews? = null

    private fun getElapsedTimeInSeconds(): Int {
        val now = System.currentTimeMillis()
        return if (startedAt == 0L) {
            0
        } else {
            if (isPaused) {
                ((pausedAt - startedAt) / 1000).toInt()
            } else {
                ((now - startedAt) / 1000).toInt()
            }
        }
    }

    private fun getCurrentTime(): String {
        val elapsedTimeInSeconds = getElapsedTimeInSeconds()
        val minutes = (elapsedTimeInSeconds % 3600) / 60
        val seconds = elapsedTimeInSeconds % 60
        return String.format("%d:%02d", minutes, seconds)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PAUSE -> pauseTimer()
            ACTION_RESUME -> resumeTimer()
            ACTION_FINISH -> timerEnded()
            else -> {
                startedAt = intent?.getLongExtra("timestamp", System.currentTimeMillis()) ?: System.currentTimeMillis()
                limitTime = intent?.getIntExtra("duration", 120) ?: 120
                startForeground(NOTIFICATION_ID, createNotification())
                startTimer()
            }
        }
        return START_STICKY
    }

    private fun startTimer() {
        handler.postDelayed(object : Runnable {
            override fun run() {
                if (isPaused) return

                progress = getElapsedTimeInSeconds()

                if (progress < limitTime) {
                    updateNotification()
                    handler.postDelayed(this, 1000)
                } else {
                    TimerServiceModule.instance?.emitTimerFinished()
                }
            }
        }, 1000)
    }


    private fun createNotification(): Notification {
        val context = applicationContext
        notificationLayout = RemoteViews(context.packageName, R.layout.notification_timer)

        val pauseIntent = Intent(ACTION_PAUSE).setPackage(context.packageName)
        val resumeIntent = Intent(ACTION_RESUME).setPackage(context.packageName)
        val stopIntent = Intent(ACTION_STOP).setPackage(context.packageName)
        val restartIntent = Intent(ACTION_RESTART).setPackage(context.packageName)

        notificationLayout?.setOnClickPendingIntent(
            R.id.btn_pause,
            PendingIntent.getBroadcast(context, 0, pauseIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        )
        notificationLayout?.setOnClickPendingIntent(
            R.id.btn_play,
            PendingIntent.getBroadcast(context, 1, resumeIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        )
        notificationLayout?.setOnClickPendingIntent(
            R.id.btn_reset,
            PendingIntent.getBroadcast(context, 2, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        )
        notificationLayout?.setOnClickPendingIntent(
            R.id.btn_restart,
            PendingIntent.getBroadcast(context, 3, restartIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        )

        notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_notification_overlay)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(notificationLayout)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOnlyAlertOnce(true)
            .setOngoing(true)
            .setColor(resources.getColor(R.color.green))
            .setColorized(true)

        notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        return notificationBuilder!!.build()
    }


    private fun updateNotification() {
        notificationLayout?.let {
            it.setTextViewText(R.id.timer_time, getCurrentTime())
            it.setProgressBar(R.id.progress_bar, limitTime, progress, false)

            it.setViewVisibility(R.id.btn_pause, if (!isPaused) View.VISIBLE else View.GONE)
            it.setViewVisibility(R.id.btn_play, if (isPaused) View.VISIBLE else View.GONE)
            it.setViewVisibility(R.id.btn_restart, View.GONE)
            it.setViewVisibility(R.id.btn_reset, View.GONE)

            notificationManager?.notify(NOTIFICATION_ID, notificationBuilder?.build())
        }
    }

    private fun pauseTimer() {
        isPaused = true
        pausedAt = System.currentTimeMillis()
        notificationLayout?.let {
            it.setTextViewText(R.id.timer_time, getCurrentTime())
            it.setProgressBar(R.id.progress_bar, limitTime, progress, false)

            it.setViewVisibility(R.id.btn_pause, View.GONE)
            it.setViewVisibility(R.id.btn_play, View.VISIBLE)
            it.setViewVisibility(R.id.btn_restart, View.VISIBLE)
            it.setViewVisibility(R.id.btn_reset, View.GONE)

            notificationManager?.notify(NOTIFICATION_ID, notificationBuilder?.build())
        }
    }

    private fun resumeTimer() {
        if (isPaused) {
            val elapsedSincePaused = System.currentTimeMillis() - pausedAt
            startedAt += elapsedSincePaused
            isPaused = false
            startTimer()
        }
    }

    private fun timerEnded() {
        notificationLayout?.let {
            it.setTextViewText(R.id.timer_time, "Well done!")

            it.setViewVisibility(R.id.progress_bar, View.INVISIBLE)
            it.setViewVisibility(R.id.btn_pause, View.GONE)
            it.setViewVisibility(R.id.btn_play, View.GONE)
            it.setViewVisibility(R.id.btn_restart, View.VISIBLE)
            it.setViewVisibility(R.id.btn_reset, View.VISIBLE)

            notificationManager?.notify(NOTIFICATION_ID, notificationBuilder?.build())
        }
    }

    companion object {
        const val CHANNEL_ID = "TIMER_NOTIFICATION_CHANNEL"
        const val NOTIFICATION_ID = 100
        const val ACTION_PAUSE = "ACTION_PAUSE"
        const val ACTION_RESUME = "ACTION_RESUME"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_FINISH = "ACTION_FINISH"
        const val ACTION_RESTART = "ACTION_RESTART"
    }
}