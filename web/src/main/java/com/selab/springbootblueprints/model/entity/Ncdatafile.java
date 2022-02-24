package com.selab.springbootblueprints.model.entity;

import javax.persistence.*;

@Entity
@Table(name = "ncdatafile")
public class Ncdatafile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "lon")
    private Double lon;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "height")
    private Double height;

    @Column(name = "value")
    private Double value;

    @Column(name = "r")
    private Integer r;

    @Column(name = "g")
    private Integer g;

    @Column(name = "b")
    private Integer b;

    public Integer getB() {
        return b;
    }

    public void setB(Integer b) {
        this.b = b;
    }

    public Integer getG() {
        return g;
    }

    public void setG(Integer g) {
        this.g = g;
    }

    public Integer getR() {
        return r;
    }

    public void setR(Integer r) {
        this.r = r;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLon() {
        return lon;
    }

    public void setLon(Double lon) {
        this.lon = lon;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}