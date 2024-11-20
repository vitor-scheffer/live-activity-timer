//
//  TimerWidgetModule.swift
//  liveactivitytimer
//
//  Created by Vitor Scheffer on 19/11/24.
//

import Foundation
import ActivityKit

@objc(TimerWidgetModule)
class TimerWidgetModule: NSObject {
  private var currentActivity: Activity<TimerWidgetAttributes>?
  private var startedAt: Date?
  private var pausedAt: Date?
  private var limitTime: Double?
  private var timer: DispatchSourceTimer?

  private func areActivitiesEnabled() -> Bool {
    return ActivityAuthorizationInfo().areActivitiesEnabled
  }
  
  private func resetTimer() {
    timer?.cancel()
    timer = nil
  }
  
  private func timerFired() {
    guard let startedAt = startedAt else { return }
      let elapsedTime = Date().timeIntervalSince(startedAt)
    if elapsedTime >= limitTime ?? 60 {
        TimerEventEmitter.emitter?.sendEvent(withName: "onFinish", body: nil)
        resetTimer()
      }
  }
  
  private func startTimer() {
    timer = DispatchSource.makeTimerSource(queue: DispatchQueue.global(priority: .high))
    timer?.schedule(deadline: .now(), repeating: .seconds(1))
    timer?.setEventHandler { [weak self] in
        self?.timerFired()
    }
    timer?.resume()
  }

  @objc
  func startLiveActivity(_ timestamp: Double, limitTime: Double) -> Void {
    stopLiveActivity()
    
    self.limitTime = limitTime
    startedAt = Date(timeIntervalSince1970: timestamp)
    
    if (!areActivitiesEnabled()) {
      return
    }
    
    let activityAttributes = TimerWidgetAttributes()
    let contentState = TimerWidgetAttributes.ContentState(startedAt: startedAt, pausedAt: nil, limitTime: self.limitTime, message: nil)
    let activityContent = ActivityContent(state: contentState, staleDate: nil)
    do {
      startTimer()
      currentActivity = try Activity.request(attributes: activityAttributes, content: activityContent)
    } catch {
      // Handle errors not necessary if it's used by adittional feature
    }
  }

  @objc
  func stopLiveActivity() -> Void {
    startedAt = nil
    
    Task {
      resetTimer()
      for activity in Activity<TimerWidgetAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }
  
  @objc
  func pause(_ timestamp: Double) -> Void {
    pausedAt = Date(timeIntervalSince1970: timestamp)
    
    let contentState = TimerWidgetAttributes.ContentState(startedAt: startedAt, pausedAt: pausedAt, limitTime: limitTime, message: nil)
    Task {
      resetTimer()
      await currentActivity?.update(
        ActivityContent<TimerWidgetAttributes.ContentState>(
          state: contentState,
          staleDate: nil
        )
      )
    }
  }
  
  @objc
  func timerEnded() -> Void {
    let contentState = TimerWidgetAttributes.ContentState(startedAt: nil, pausedAt: nil, limitTime: nil, message: "Well done!")
    Task {
      await currentActivity?.update(
        ActivityContent<TimerWidgetAttributes.ContentState>(
          state: contentState,
          staleDate: nil
        )
      )
    }
  }
  
  @objc
  func resume() -> Void {
    guard let startDate = self.startedAt else { return }
    guard let pauseDate = self.pausedAt else { return }
    
    let elapsedSincePaused = Date().timeIntervalSince1970 - pauseDate.timeIntervalSince1970
    startedAt = Date(timeIntervalSince1970: startDate.timeIntervalSince1970 + elapsedSincePaused)
    pausedAt = nil
    
    let contentState = TimerWidgetAttributes.ContentState(startedAt: startedAt, pausedAt: nil, limitTime: limitTime, message: nil)
    Task {
      startTimer()
      await currentActivity?.update(
        ActivityContent<TimerWidgetAttributes.ContentState>(
          state: contentState,
          staleDate: nil
        )
      )
    }
  }
}
