package com.selab.springbootblueprints.model.bean;

import java.util.Arrays;

public class DataSources {
    double[] position;
    String[] normal;
    int[] color;

    public DataSources(double[] position, String[] normal, int[] color) {
        this.position = position;
        this.normal = normal;
        this.color = color;
    }

    public String toString() {
        return "{\"position\":" + Arrays.toString(position) + ",\"normal\":" + Arrays.toString(normal) + ",\"color\":" + Arrays.toString(color) + "}";
    }
}
