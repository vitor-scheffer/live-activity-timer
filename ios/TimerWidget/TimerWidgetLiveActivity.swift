//
//  TimerWidgetLiveActivity.swift
//  TimerWidget
//
//  Created by Vitor Scheffer on 19/11/24.
//

import ActivityKit
import WidgetKit
import SwiftUI
import AppIntents

struct TimerWidgetAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var startedAt: Date?
    var pausedAt: Date?
    var limitTime: Double?
    var message: String?
    
    func getElapsedTimeInSeconds() -> Int {
      let now = Date()
      guard let startedAt = self.startedAt else {
        return 0
      }
      guard let pausedAt = self.pausedAt else {
        return Int(now.timeIntervalSince1970 - startedAt.timeIntervalSince1970)
      }
      return Int(pausedAt.timeIntervalSince1970 - startedAt.timeIntervalSince1970)
    }
    
    func getPausedTime() -> String {
      let elapsedTimeInSeconds = getElapsedTimeInSeconds()
      let minutes = (elapsedTimeInSeconds % 3600) / 60
      let seconds = elapsedTimeInSeconds % 60
      return String(format: "%d:%02d", minutes, seconds)
    }
    
    func getTimeIntervalSinceNow() -> Double {
      guard let startedAt = self.startedAt else {
        return 0
      }
      return startedAt.timeIntervalSince1970 - Date().timeIntervalSince1970
    }
    
    func isRunning() -> Bool {
      return pausedAt == nil
    }
    
    func isFinished() -> Bool {
      return message != nil
    }
    
    func getLimitTime() -> Double {
      guard let limitTime = limitTime else {
        return 60
      }
      return limitTime
    }
    
    func calculatedProgress() -> Double {
      guard let startedAt = self.startedAt else {
        return 0
      }
      
      let totalDuration: TimeInterval = getLimitTime()
      let elapsedTime: TimeInterval
      
      if let pausedAt = self.pausedAt {
        elapsedTime = pausedAt.timeIntervalSince(startedAt)
      } else {
        elapsedTime = Date().timeIntervalSince(startedAt)
      }
      
      return min(max(elapsedTime / totalDuration, 0), 1)
    }
  }
}

struct TimerWidgetLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: TimerWidgetAttributes.self) { context in
      HStack {
        
        if (context.state.isFinished()) {
          Text("Well done!")
            .font(.title)
            .fontWeight(.semibold)
          
          Spacer()
        }
        
        else {
          if (context.state.isRunning()) {
            Text(
              Date(timeIntervalSinceNow: context.state.getTimeIntervalSinceNow()),
              style: .timer
            )
            .font(.title)
            .fontWeight(.semibold)
            .monospacedDigit()
            .frame(width: 70)
          } else {
            Text(
              context.state.getPausedTime()
            )
            .font(.title)
            .fontWeight(.semibold)
            .monospacedDigit()
            .frame(width: 70)
          }
          
          if (context.state.isRunning()) {
            ProgressView(timerInterval: (context.state.startedAt ?? Date())...(context.state.startedAt?.addingTimeInterval(context.state.getLimitTime()) ?? Date().addingTimeInterval(context.state.getLimitTime())), countsDown: false)
              .padding(.leading, 5)
              .padding(.trailing, 15)
              .tint(Color.black)
              .labelsHidden()
              .frame(height: 8)
          } else {
            ProgressView(value: context.state.calculatedProgress())
              .padding(.leading, 5)
              .padding(.trailing, 15)
              .tint(Color.black)
              .labelsHidden()
              .frame(height: 8)
          }
        }
        
        if (context.state.isFinished()) {
          if #available(iOS 17.0, *) {
            HStack(alignment: .center) {
              createActionButton(imageName: "arrow.trianglehead.counterclockwise.rotate.90", intent: RestartIntent())
              createActionButton(imageName: "xmark", intent: ResetIntent())
            }
          }
        }
        
        else {
          if #available(iOS 17.0, *) {
            if (context.state.isRunning()) {
              createActionButton(imageName: "pause.fill", intent: PauseIntent())
            } else {
              HStack(alignment: .center) {
                createActionButton(imageName: "arrow.trianglehead.counterclockwise.rotate.90", intent: RestartIntent())
                createActionButton(imageName: "play.fill", intent: ResumeIntent())
              }
            }
          }
        }
      }
      .activityBackgroundTint(Color.cyan)
      .activitySystemActionForegroundColor(Color.black)
      .padding()
    } dynamicIsland: { context in
      DynamicIsland {
        // Expanded Region
        DynamicIslandExpandedRegion(.center) {
          ZStack {
            RoundedRectangle(cornerRadius: 24).strokeBorder(Color(red: 148/255.0, green: 163/255.0, blue: 184/255.0), lineWidth: 2)
            HStack {
              HStack(spacing: 8.0, content: {
                if #available(iOS 17.0, *) {
                  if (context.state.isFinished()) {
                    createPrimaryIslandActionButton(imageName: "arrow.trianglehead.counterclockwise.rotate.90", intent: RestartIntent())
                  } else {
                    if (context.state.isRunning()) {
                      createPrimaryIslandActionButton(imageName: "pause.fill", intent: PauseIntent())
                    } else {
                      createPrimaryIslandActionButton(imageName: "play.fill", intent: ResumeIntent())
                    }
                  }
                  createSecondaryIslandActionButton(imageName: "xmark", intent: ResetIntent())
                }
                Spacer()
              })
              
              if (context.state.isFinished()) {
                Text("Well done!")
                .font(.title)
                .fontWeight(.semibold)
                .foregroundColor(Color.cyan)
                .fontWeight(.medium)
              }
              
              else {
                if (!context.state.isRunning()) {
                  Text(
                    context.state.getPausedTime()
                  )
                  .font(.title)
                  .foregroundColor(Color.cyan)
                  .fontWeight(.medium)
                  .monospacedDigit()
                  .transition(.identity)
                } else {
                  Text(
                    Date(
                      timeIntervalSinceNow: context.state.getTimeIntervalSinceNow()
                    ),
                    style: .timer
                  )
                  .font(.title)
                  .foregroundColor(Color.cyan)
                  .fontWeight(.medium)
                  .monospacedDigit()
                  .frame(width: 60)
                  .transition(.identity)
                }
              }
            }
            .padding()
          }
          .padding()
        }
      } compactLeading: {
        Image(systemName: "timer")
          .imageScale(.medium)
          .foregroundColor(Color.cyan)
      } compactTrailing: {
        if (context.state.isFinished()) {
          Text("Well done!")
          .foregroundColor(Color.cyan)
          .monospacedDigit()
          .frame(maxWidth: 32)
        }
        
        else {
          if (context.state.pausedAt != nil) {
            Text(context.state.getPausedTime())
              .foregroundColor(Color.cyan)
              .monospacedDigit()
          } else {
            Text(
              Date(
                timeIntervalSinceNow: context.state.getTimeIntervalSinceNow()
              ),
              style: .timer
            )
            .foregroundColor(Color.cyan)
            .monospacedDigit()
            .frame(maxWidth: 32)
          }
        }
      } minimal: {
        Image(systemName: "timer")
          .imageScale(.medium)
          .foregroundColor(Color.cyan)
      }
      .widgetURL(URL(string: "http://www.apple.com"))
      .keylineTint(Color.red)
    }
  }
}

extension TimerWidgetLiveActivity {
  @available(iOS 17.0, *)
  @ViewBuilder
  func createActionButton(imageName: String, intent: some LiveActivityIntent) -> some View {
      Button(intent: intent) {
        Image(systemName: imageName)
              .imageScale(.medium)
      }
      .padding()
      .background(Color.white)
      .frame(width: 35, height: 35)
      .cornerRadius(12)
  }
  
  @available(iOS 17.0, *)
  @ViewBuilder
  func createPrimaryIslandActionButton(imageName: String, intent: some LiveActivityIntent) -> some View {
    Button(intent: intent) {
      ZStack {
        Circle().fill(Color.cyan.opacity(0.5))
        Image(systemName: imageName)
          .imageScale(.large)
          .foregroundColor(.cyan)
      }
    }
    .buttonStyle(PlainButtonStyle())
    .contentShape(Rectangle())
  }
  
  @available(iOS 17.0, *)
  @ViewBuilder
  func createSecondaryIslandActionButton(imageName: String, intent: some LiveActivityIntent) -> some View {
    Button(intent: intent) {
      ZStack {
        Circle().fill(.gray.opacity(0.5))
        Image(systemName: imageName)
          .imageScale(.medium)
          .foregroundColor(.white)
      }
    }
    .buttonStyle(PlainButtonStyle())
    .contentShape(Rectangle())
  }
}

extension TimerWidgetAttributes {
  fileprivate static var preview: TimerWidgetAttributes {
    TimerWidgetAttributes()
  }
}

extension TimerWidgetAttributes.ContentState {
  fileprivate static var initState: TimerWidgetAttributes.ContentState {
    TimerWidgetAttributes.ContentState(startedAt: Date())
  }
}
