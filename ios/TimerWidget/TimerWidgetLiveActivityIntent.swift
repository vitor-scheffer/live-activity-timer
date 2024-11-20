//
//  TimerWidgetLiveActivityIntent.swift
//  liveactivitytimer
//
//  Created by Vitor Scheffer on 19/11/24.
//

import Foundation
import AppIntents

public struct PauseIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Pause timer"
  public func perform() async throws -> some IntentResult {
    TimerEventEmitter.emitter?.sendEvent(withName: "onPause", body: nil)
    return .result()
  }
}

public struct ResumeIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Resume timer"
  public func perform() async throws -> some IntentResult {
    TimerEventEmitter.emitter?.sendEvent(withName: "onResume", body: nil)
    return .result()
  }
}

public struct RestartIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Restart timer"
  public func perform() async throws -> some IntentResult {
    TimerEventEmitter.emitter?.sendEvent(withName: "onRestart", body: nil)
    return .result()
  }
}

public struct ResetIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Reset timer"
  public func perform() async throws -> some IntentResult {
    TimerEventEmitter.emitter?.sendEvent(withName: "onReset", body: nil)
    return .result()
  }
}

public struct FinishTimeIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Finish timer"
  public func perform() async throws -> some IntentResult {
    TimerEventEmitter.emitter?.sendEvent(withName: "onFinish", body: nil)
    return .result()
  }
}
