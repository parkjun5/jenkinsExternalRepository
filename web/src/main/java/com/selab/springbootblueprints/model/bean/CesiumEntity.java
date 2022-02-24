package com.selab.springbootblueprints.model.bean;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CesiumEntity {
    private double longitude;
    private double latitude;
    private double height;
    private double value;
}
