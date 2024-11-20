//
//  IntentPlaceholder.swift
//  TimerWidgetExtension
//
//  Created by Vitor Scheffer on 19/11/24.
//

import AppIntents

public struct PauseIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Pause timer"
  public func perform() async throws -> some IntentResult {
    return .result()
  }
}

public struct ResumeIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Resume timer"
  public func perform() async throws -> some IntentResult {
    return .result()
  }
}

public struct RestartIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Restart timer"
  public func perform() async throws -> some IntentResult {
    return .result()
  }
}

public struct ResetIntent: LiveActivityIntent {
  public init() {}
  public static var title: LocalizedStringResource = "Reset timer"
  public func perform() async throws -> some IntentResult {
    return .result()
  }
}
