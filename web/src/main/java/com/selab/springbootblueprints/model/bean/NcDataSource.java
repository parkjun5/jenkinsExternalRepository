package com.selab.springbootblueprints.model.bean;

import lombok.Builder;
import lombok.Data;

import java.util.Arrays;

@Data
@Builder
public class NcDataSource {
    double[] position;
    double[] normal;
    int[] color;

    public String toString() {
        return "{\"position\":" + Arrays.toString(position) + ",\"normal\":" + Arrays.toString(normal) + ",\"color\":" + Arrays.toString(color) + "}";
    }
}
