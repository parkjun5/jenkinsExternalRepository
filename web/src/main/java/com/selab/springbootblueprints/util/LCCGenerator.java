//package com.selab.springbootblueprints.util;
//
//import lombok.Builder;
//
//public class LCCGenerator {
//    @Builder
//    public class LCCBasicMap {
//        double earthRadius; // # 사용할 지구반경 [ km ]
//        double grid;// 격자간격 [ km ]
//        double standardLatOne; // 표준위도 2 [degree]
//        double standardLatTwo; // 표준위도 1 [degree]
//        double operateLongitude; // 기준점의 경도 [degree]
//        double operateLatitude; //  기준점의 위도 [degree]
//        double operateX; // 기준점의 X좌표 [격자거리]
//        double operateY; // 기준점의 Y좌표 [격자거리]
//        int startFlag;  // 시작여부 (0 = 시작)
//    }
//
//
//    public class LCCResult {
//        int lon;
//        int lat;
//        int x;
//        int y;
//    }
//
//    public LCCBasicMap initBaseMap() {
//        return LCCBasicMap.builder().earthRadius(6370.19584)
//                .grid(1.0)
//                .standardLatOne(30.0)
//                .standardLatTwo(60.0)
//                .operateLatitude(38.0)
//                .operateLongitude(126.0)
//                .build();
//
//    }
//
//    public LCCResult calculateLcc(LCCBasicMap baseMap) {
//
//
//        return null;
//    }
//
//}
