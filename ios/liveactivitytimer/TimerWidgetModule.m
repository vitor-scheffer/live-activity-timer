//
//  TimerWidgetModule.m
//  liveactivitytimer
//
//  Created by Vitor Scheffer on 19/11/24.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TimerWidgetModule, NSObject)

+ (bool)requiresMainQueueSetup {
  return NO;
}

RCT_EXTERN_METHOD(startLiveActivity:(nonnull double *)timestamp
                           limitTime:(nonnull double *))
RCT_EXTERN_METHOD(pauseTimer:(nonnull double *)timestamp)
RCT_EXTERN_METHOD(resumeTimer)
RCT_EXTERN_METHOD(stopLiveActivity)
RCT_EXTERN_METHOD(timerEnded)

@end
