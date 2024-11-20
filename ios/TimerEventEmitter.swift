//
//  TimerEventEmitter.swift
//  liveactivitytimer
//
//  Created by Vitor Scheffer on 19/11/24.
//

import Foundation

@objc(TimerEventEmitter)
class TimerEventEmitter: RCTEventEmitter {

  public static var emitter: TimerEventEmitter?

  override init() {
    super.init()
    TimerEventEmitter.emitter = self
  }

  override func supportedEvents() -> [String]! {
    return ["onPause", "onResume", "onRestart", "onReset", "onFinish"]
  }
}
